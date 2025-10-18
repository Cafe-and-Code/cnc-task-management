import React, { useState, useEffect } from 'react';
import {
  Users,
  ArrowLeft,
  Edit,
  Settings,
  Calendar,
  Clock,
  Mail,
  Phone,
  MapPin,
  Award,
  Target,
  TrendingUp,
  TrendingDown,
  Activity,
  CheckCircle,
  AlertCircle,
  Star,
  BarChart3,
  PieChart,
  Filter,
  Search,
  Plus,
  UserPlus,
  MoreVertical,
  MessageSquare,
  Video,
  FileText,
  Download,
  Upload,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Bell,
  BellOff,
  Shield,
  Zap,
  GitBranch,
  Coffee,
} from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  avatarUrl?: string;
  email: string;
  phone?: string;
  location?: string;
  role: string;
  department: string;
  status: 'active' | 'inactive' | 'busy' | 'away' | 'on-vacation';
  joinDate: string;
  lastActive: string;
  skills: string[];
  expertise: Array<{
    area: string;
    level: number; // 1-5
  }>;
  performance: {
    tasksCompleted: number;
    tasksInProgress: number;
    hoursLogged: number;
    averageCompletionTime: number;
    qualityScore: number;
    velocity: number;
    efficiency: number;
  };
  availability: {
    timezone: string;
    workingHours: {
      start: string;
      end: string;
    };
    currentLoad: number; // 0-100
    maxCapacity: number; // tasks per week
  };
  communication: {
    preferredChannels: string[];
    responseTime: string;
    languages: string[];
  };
  projects: Array<{
    id: string;
    name: string;
    role: string;
    contribution: string;
  }>;
  achievements: Array<{
    id: string;
    title: string;
    description: string;
    date: string;
    type: 'award' | 'milestone' | 'certification';
  }>;
  notes: string;
}

interface TeamMetrics {
  totalMembers: number;
  activeMembers: number;
  averagePerformance: number;
  totalTasksCompleted: number;
  totalHoursLogged: number;
  teamVelocity: number;
  efficiency: number;
  satisfaction: number;
  collaborationScore: number;
  skillsCoverage: Record<string, number>;
  workloadDistribution: {
    balanced: boolean;
    overloaded: string[];
    underutilized: string[];
  };
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
  department: string;
  members: TeamMember[];
  metrics: TeamMetrics;
  projects: Array<{
    id: string;
    name: string;
    status: string;
    startDate: string;
    endDate?: string;
    progress: number;
  }>;
  upcomingEvents: Array<{
    id: string;
    title: string;
    type: 'meeting' | 'deadline' | 'review' | 'celebration';
    date: string;
    attendees: string[];
  }>;
  recentActivity: Array<{
    id: string;
    type: 'task_completed' | 'member_joined' | 'project_started' | 'achievement';
    description: string;
    userId: string;
    userName: string;
    timestamp: string;
  }>;
}

interface TeamDetailPageProps {
  teamId: string;
}

const TeamDetailPage: React.FC<TeamDetailPageProps> = ({ teamId }) => {
  const [team, setTeam] = useState<Team | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'members' | 'performance' | 'projects' | 'activity'
  >('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [expandedMembers, setExpandedMembers] = useState<Set<string>>(new Set());
  const [showMemberDetails, setShowMemberDetails] = useState(true);

  // Mock data
  useEffect(() => {
    setTimeout(() => {
      const mockTeam: Team = {
        id: teamId,
        name: 'Frontend Development',
        description:
          'Responsible for user interface development, user experience design, and frontend architecture. This team works closely with design and backend teams to deliver exceptional user experiences.',
        status: 'active',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-15T10:30:00Z',
        leadId: 'user-1',
        leadName: 'Alice Johnson',
        department: 'Engineering',
        members: [
          {
            id: 'user-1',
            name: 'Alice Johnson',
            avatarUrl: 'https://picsum.photos/seed/alice/64/64.jpg',
            email: 'alice.johnson@company.com',
            phone: '+1 (555) 123-4567',
            location: 'San Francisco, CA',
            role: 'Team Lead',
            department: 'Engineering',
            status: 'active',
            joinDate: '2023-01-15T00:00:00Z',
            lastActive: '2024-01-15T14:30:00Z',
            skills: ['React', 'TypeScript', 'Node.js', 'AWS', 'Leadership'],
            expertise: [
              { area: 'Frontend Development', level: 5 },
              { area: 'Team Leadership', level: 4 },
              { area: 'System Architecture', level: 4 },
              { area: 'DevOps', level: 3 },
            ],
            performance: {
              tasksCompleted: 42,
              tasksInProgress: 3,
              hoursLogged: 156,
              averageCompletionTime: 2.8,
              qualityScore: 4.7,
              velocity: 48,
              efficiency: 92,
            },
            availability: {
              timezone: 'PST',
              workingHours: { start: '09:00', end: '17:00' },
              currentLoad: 75,
              maxCapacity: 8,
            },
            communication: {
              preferredChannels: ['Slack', 'Email', 'Video Call'],
              responseTime: '< 2 hours',
              languages: ['English', 'Spanish'],
            },
            projects: [
              {
                id: 'proj-1',
                name: 'E-commerce Platform',
                role: 'Lead Developer',
                contribution: 'Frontend architecture and team coordination',
              },
              {
                id: 'proj-2',
                name: 'Mobile App Redesign',
                role: 'Tech Lead',
                contribution: 'React Native development and team mentoring',
              },
            ],
            achievements: [
              {
                id: 'ach-1',
                title: 'Employee of the Quarter',
                description: 'Outstanding leadership and project delivery',
                date: '2024-01-01T00:00:00Z',
                type: 'award',
              },
              {
                id: 'ach-2',
                title: 'AWS Certified Developer',
                description: 'Completed AWS Developer Associate certification',
                date: '2023-11-15T00:00:00Z',
                type: 'certification',
              },
            ],
            notes:
              'Excellent leader with strong technical skills and great team management abilities. Promoted to Team Lead in 2023.',
          },
          {
            id: 'user-2',
            name: 'Bob Smith',
            avatarUrl: 'https://picsum.photos/seed/bob/64/64.jpg',
            email: 'bob.smith@company.com',
            phone: '+1 (555) 234-5678',
            location: 'New York, NY',
            role: 'Senior Developer',
            department: 'Engineering',
            status: 'active',
            joinDate: '2023-03-20T00:00:00Z',
            lastActive: '2024-01-15T16:45:00Z',
            skills: ['React', 'Vue.js', 'JavaScript', 'CSS', 'Testing'],
            expertise: [
              { area: 'Frontend Development', level: 4 },
              { area: 'UI/UX Design', level: 3 },
              { area: 'Testing', level: 4 },
              { area: 'Performance Optimization', level: 3 },
            ],
            performance: {
              tasksCompleted: 38,
              tasksInProgress: 5,
              hoursLogged: 142,
              averageCompletionTime: 3.1,
              qualityScore: 4.5,
              velocity: 44,
              efficiency: 88,
            },
            availability: {
              timezone: 'EST',
              workingHours: { start: '10:00', end: '18:00' },
              currentLoad: 85,
              maxCapacity: 7,
            },
            communication: {
              preferredChannels: ['Slack', 'Email'],
              responseTime: '< 1 hour',
              languages: ['English'],
            },
            projects: [
              {
                id: 'proj-1',
                name: 'E-commerce Platform',
                role: 'Senior Developer',
                contribution: 'Component development and code review',
              },
              {
                id: 'proj-3',
                name: 'Design System',
                role: 'Lead Developer',
                contribution: 'Design system architecture and implementation',
              },
            ],
            achievements: [
              {
                id: 'ach-3',
                title: '100 Tasks Completed',
                description: 'Milestone: Completed 100 tasks',
                date: '2024-01-10T00:00:00Z',
                type: 'milestone',
              },
            ],
            notes:
              'Strong developer with excellent problem-solving skills. Very reliable and consistently delivers high-quality work.',
          },
          {
            id: 'user-3',
            name: 'Carol Davis',
            avatarUrl: 'https://picsum.photos/seed/carol/64/64.jpg',
            email: 'carol.davis@company.com',
            phone: '+1 (555) 345-6789',
            location: 'Austin, TX',
            role: 'UI/UX Designer',
            department: 'Design',
            status: 'busy',
            joinDate: '2023-06-10T00:00:00Z',
            lastActive: '2024-01-15T15:20:00Z',
            skills: ['Figma', 'Adobe XD', 'Sketch', 'Prototyping', 'User Research'],
            expertise: [
              { area: 'UI Design', level: 5 },
              { area: 'UX Research', level: 4 },
              { area: 'Prototyping', level: 4 },
              { area: 'Design Systems', level: 3 },
            ],
            performance: {
              tasksCompleted: 25,
              tasksInProgress: 4,
              hoursLogged: 98,
              averageCompletionTime: 3.5,
              qualityScore: 4.8,
              velocity: 35,
              efficiency: 85,
            },
            availability: {
              timezone: 'CST',
              workingHours: { start: '09:00', end: '17:00' },
              currentLoad: 90,
              maxCapacity: 6,
            },
            communication: {
              preferredChannels: ['Slack', 'Figma', 'Video Call'],
              responseTime: '< 3 hours',
              languages: ['English', 'French'],
            },
            projects: [
              {
                id: 'proj-2',
                name: 'Mobile App Redesign',
                role: 'Lead Designer',
                contribution: 'UI/UX design and user research',
              },
              {
                id: 'proj-3',
                name: 'Design System',
                role: 'Designer',
                contribution: 'Design system components and guidelines',
              },
            ],
            achievements: [
              {
                id: 'ach-4',
                title: 'Design Excellence Award',
                description: 'Outstanding contribution to product design',
                date: '2023-12-01T00:00:00Z',
                type: 'award',
              },
            ],
            notes:
              'Creative designer with strong user advocacy. Excellent at creating intuitive and beautiful interfaces.',
          },
          {
            id: 'user-4',
            name: 'David Wilson',
            avatarUrl: 'https://picsum.photos/seed/david/64/64.jpg',
            email: 'david.wilson@company.com',
            phone: '+1 (555) 456-7890',
            location: 'Seattle, WA',
            role: 'Junior Developer',
            department: 'Engineering',
            status: 'active',
            joinDate: '2023-09-01T00:00:00Z',
            lastActive: '2024-01-15T11:15:00Z',
            skills: ['React', 'JavaScript', 'HTML', 'CSS', 'Git'],
            expertise: [
              { area: 'Frontend Development', level: 2 },
              { area: 'HTML/CSS', level: 3 },
              { area: 'JavaScript', level: 2 },
              { area: 'Version Control', level: 3 },
            ],
            performance: {
              tasksCompleted: 18,
              tasksInProgress: 2,
              hoursLogged: 76,
              averageCompletionTime: 4.2,
              qualityScore: 4.2,
              velocity: 28,
              efficiency: 78,
            },
            availability: {
              timezone: 'PST',
              workingHours: { start: '09:00', end: '17:00' },
              currentLoad: 60,
              maxCapacity: 5,
            },
            communication: {
              preferredChannels: ['Slack', 'Email'],
              responseTime: '< 4 hours',
              languages: ['English'],
            },
            projects: [
              {
                id: 'proj-1',
                name: 'E-commerce Platform',
                role: 'Junior Developer',
                contribution: 'Bug fixes and minor features',
              },
            ],
            achievements: [],
            notes:
              'Eager learner with great potential. Quickly adapting to team processes and technologies.',
          },
        ],
        metrics: {
          totalMembers: 4,
          activeMembers: 3,
          averagePerformance: 86,
          totalTasksCompleted: 123,
          totalHoursLogged: 472,
          teamVelocity: 45,
          efficiency: 87,
          satisfaction: 4.5,
          collaborationScore: 92,
          skillsCoverage: {
            React: 4,
            TypeScript: 3,
            'UI Design': 4,
            JavaScript: 3,
            CSS: 3,
            Leadership: 1,
          },
          workloadDistribution: {
            balanced: false,
            overloaded: ['Carol Davis'],
            underutilized: ['David Wilson'],
          },
        },
        projects: [
          {
            id: 'proj-1',
            name: 'E-commerce Platform',
            status: 'active',
            startDate: '2024-01-01T00:00:00Z',
            progress: 75,
          },
          {
            id: 'proj-2',
            name: 'Mobile App Redesign',
            status: 'in-progress',
            startDate: '2024-01-10T00:00:00Z',
            progress: 45,
          },
          {
            id: 'proj-3',
            name: 'Design System',
            status: 'completed',
            startDate: '2023-12-01T00:00:00Z',
            endDate: '2024-01-05T00:00:00Z',
            progress: 100,
          },
        ],
        upcomingEvents: [
          {
            id: 'event-1',
            title: 'Sprint Planning',
            type: 'meeting',
            date: '2024-01-16T10:00:00Z',
            attendees: ['user-1', 'user-2', 'user-3', 'user-4'],
          },
          {
            id: 'event-2',
            title: 'Design Review',
            type: 'review',
            date: '2024-01-17T14:00:00Z',
            attendees: ['user-1', 'user-3'],
          },
          {
            id: 'event-3',
            title: 'Project Deadline',
            type: 'deadline',
            date: '2024-01-20T23:59:59Z',
            attendees: ['user-1', 'user-2', 'user-3', 'user-4'],
          },
        ],
        recentActivity: [
          {
            id: 'act-1',
            type: 'task_completed',
            description: 'Bob Smith completed "Implement checkout flow"',
            userId: 'user-2',
            userName: 'Bob Smith',
            timestamp: '2024-01-15T16:45:00Z',
          },
          {
            id: 'act-2',
            type: 'achievement',
            description: 'Alice Johnson earned "Employee of the Quarter"',
            userId: 'user-1',
            userName: 'Alice Johnson',
            timestamp: '2024-01-15T10:30:00Z',
          },
          {
            id: 'act-3',
            type: 'project_started',
            description: 'Started "Mobile App Redesign" project',
            userId: 'user-3',
            userName: 'Carol Davis',
            timestamp: '2024-01-15T09:00:00Z',
          },
        ],
      };

      setTeam(mockTeam);
      setIsLoading(false);
    }, 500);
  }, [teamId]);

  const toggleMemberExpansion = (memberId: string) => {
    const newExpanded = new Set(expandedMembers);
    if (newExpanded.has(memberId)) {
      newExpanded.delete(memberId);
    } else {
      newExpanded.add(memberId);
    }
    setExpandedMembers(newExpanded);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20';
      case 'inactive':
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50';
      case 'busy':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/20';
      case 'away':
        return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/20';
      case 'on-vacation':
        return 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/20';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50';
    }
  };

  const getExpertiseColor = (level: number) => {
    if (level >= 4) return 'bg-green-500';
    if (level >= 3) return 'bg-blue-500';
    if (level >= 2) return 'bg-yellow-500';
    return 'bg-gray-400';
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'text-green-600 dark:text-green-400';
    if (score >= 75) return 'text-blue-600 dark:text-blue-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    if (score >= 40) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'task_completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'achievement':
        return <Award className="w-4 h-4 text-yellow-500" />;
      case 'project_started':
        return <Target className="w-4 h-4 text-blue-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const filteredMembers =
    team?.members.filter(
      member =>
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
    ) || [];

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
        <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="text-center py-12">
        <Users className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">Team not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{team.name}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">{team.description}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <Settings className="w-5 h-5" />
          </button>
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <UserPlus className="w-4 h-4 mr-2" />
            Add Member
          </button>
        </div>
      </div>

      {/* Team Overview Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
              {team.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{team.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{team.department}</p>
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(team.status)}`}
              >
                {team.status}
              </span>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Team Lead</p>
            <div className="flex items-center space-x-2">
              <img
                src="https://picsum.photos/seed/lead/24/24.jpg"
                alt={team.leadName}
                className="w-6 h-6 rounded-full"
              />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {team.leadName}
              </span>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Members</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {team.metrics.totalMembers} total, {team.metrics.activeMembers} active
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Team Efficiency</p>
            <p className={`text-lg font-semibold ${getPerformanceColor(team.metrics.efficiency)}`}>
              {team.metrics.efficiency}%
            </p>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Tasks Completed</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {team.metrics.totalTasksCompleted}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Team Velocity</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {team.metrics.teamVelocity}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Hours Logged</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {team.metrics.totalHoursLogged}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Satisfaction</p>
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                {team.metrics.satisfaction}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'members', label: 'Members' },
            { id: 'performance', label: 'Performance' },
            { id: 'projects', label: 'Projects' },
            { id: 'activity', label: 'Activity' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Team Skills Coverage */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Team Skills Coverage
              </h3>
              <div className="space-y-3">
                {Object.entries(team.metrics.skillsCoverage).map(([skill, coverage]) => (
                  <div key={skill}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {skill}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {coverage} members
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(coverage / team.metrics.totalMembers) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Upcoming Events
              </h3>
              <div className="space-y-3">
                {team.upcomingEvents.map(event => (
                  <div
                    key={event.id}
                    className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                  >
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                      <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">{event.title}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(event.date).toLocaleString()}
                      </p>
                    </div>
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs">
                      {event.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Workload Distribution */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Workload Distribution
              </h3>
              <div
                className={`p-4 rounded-lg ${
                  team.metrics.workloadDistribution.balanced
                    ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                    : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300'
                }`}
              >
                <div className="flex items-center space-x-2 mb-2">
                  {team.metrics.workloadDistribution.balanced ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <AlertCircle className="w-5 h-5" />
                  )}
                  <span className="font-medium">
                    {team.metrics.workloadDistribution.balanced ? 'Balanced' : 'Imbalanced'}
                  </span>
                </div>
                {!team.metrics.workloadDistribution.balanced && (
                  <div className="text-sm">
                    {team.metrics.workloadDistribution.overloaded.length > 0 && (
                      <p className="mb-1">
                        Overloaded: {team.metrics.workloadDistribution.overloaded.join(', ')}
                      </p>
                    )}
                    {team.metrics.workloadDistribution.underutilized.length > 0 && (
                      <p>
                        Underutilized: {team.metrics.workloadDistribution.underutilized.join(', ')}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Recent Activity
              </h3>
              <div className="space-y-3">
                {team.recentActivity.map(activity => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    {getEventTypeIcon(activity.type)}
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 dark:text-white">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {activity.userName} • {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Members Tab */}
        {activeTab === 'members' && (
          <div>
            {/* Search and Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
              <div className="flex items-center space-x-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search members..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <button className="flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </button>
                <button
                  onClick={() => setShowMemberDetails(!showMemberDetails)}
                  className="flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400"
                >
                  {showMemberDetails ? (
                    <EyeOff className="w-4 h-4 mr-2" />
                  ) : (
                    <Eye className="w-4 h-4 mr-2" />
                  )}
                  {showMemberDetails ? 'Hide Details' : 'Show Details'}
                </button>
              </div>
            </div>

            {/* Members List */}
            <div className="space-y-4">
              {filteredMembers.map(member => (
                <div
                  key={member.id}
                  className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-4">
                        <img
                          src={member.avatarUrl}
                          alt={member.name}
                          className="w-16 h-16 rounded-full"
                        />
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {member.name}
                            </h3>
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(member.status)}`}
                            >
                              {member.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {member.role} • {member.department}
                          </p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                            <span className="flex items-center space-x-1">
                              <Mail className="w-3 h-3" />
                              <span>{member.email}</span>
                            </span>
                            {member.phone && (
                              <span className="flex items-center space-x-1">
                                <Phone className="w-3 h-3" />
                                <span>{member.phone}</span>
                              </span>
                            )}
                            {member.location && (
                              <span className="flex items-center space-x-1">
                                <MapPin className="w-3 h-3" />
                                <span>{member.location}</span>
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
                          <Video className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleMemberExpansion(member.id)}
                          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          {expandedMembers.has(member.id) ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Tasks Completed</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {member.performance.tasksCompleted}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">In Progress</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {member.performance.tasksInProgress}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Hours Logged</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {member.performance.hoursLogged}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Quality Score</p>
                        <p
                          className={`text-lg font-semibold ${getPerformanceColor(member.performance.qualityScore * 20)}`}
                        >
                          {member.performance.qualityScore}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Current Load</p>
                        <p
                          className={`text-lg font-semibold ${
                            member.availability.currentLoad > 80
                              ? 'text-red-600 dark:text-red-400'
                              : member.availability.currentLoad > 60
                                ? 'text-yellow-600 dark:text-yellow-400'
                                : 'text-green-600 dark:text-green-400'
                          }`}
                        >
                          {member.availability.currentLoad}%
                        </p>
                      </div>
                    </div>

                    {/* Skills */}
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                        Skills
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {member.skills.map(skill => (
                          <span
                            key={skill}
                            className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedMembers.has(member.id) && showMemberDetails && (
                    <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30 p-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Expertise Levels */}
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                            Expertise Levels
                          </h4>
                          <div className="space-y-2">
                            {member.expertise.map(exp => (
                              <div key={exp.area}>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-sm text-gray-900 dark:text-white">
                                    {exp.area}
                                  </span>
                                  <span className="text-sm text-gray-600 dark:text-gray-400">
                                    {exp.level}/5
                                  </span>
                                </div>
                                <div className="flex space-x-1">
                                  {[...Array(5)].map((_, i) => (
                                    <div
                                      key={i}
                                      className={`h-2 flex-1 rounded-full ${
                                        i < exp.level
                                          ? getExpertiseColor(exp.level)
                                          : 'bg-gray-200 dark:bg-gray-700'
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Availability */}
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                            Availability
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Timezone:</span>
                              <span className="text-gray-900 dark:text-white">
                                {member.availability.timezone}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">
                                Working Hours:
                              </span>
                              <span className="text-gray-900 dark:text-white">
                                {member.availability.workingHours.start} -{' '}
                                {member.availability.workingHours.end}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">
                                Max Capacity:
                              </span>
                              <span className="text-gray-900 dark:text-white">
                                {member.availability.maxCapacity} tasks/week
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">
                                Response Time:
                              </span>
                              <span className="text-gray-900 dark:text-white">
                                {member.communication.responseTime}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Projects */}
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                            Current Projects
                          </h4>
                          <div className="space-y-2">
                            {member.projects.map(project => (
                              <div
                                key={project.id}
                                className="p-3 bg-white dark:bg-gray-800 rounded-lg"
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                      {project.name}
                                    </p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                      {project.role}
                                    </p>
                                  </div>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  {project.contribution}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Achievements */}
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                            Achievements
                          </h4>
                          <div className="space-y-2">
                            {member.achievements.length > 0 ? (
                              member.achievements.map(achievement => (
                                <div
                                  key={achievement.id}
                                  className="p-3 bg-white dark:bg-gray-800 rounded-lg"
                                >
                                  <div className="flex items-center space-x-2">
                                    <Award className="w-4 h-4 text-yellow-500" />
                                    <div>
                                      <p className="font-medium text-gray-900 dark:text-white">
                                        {achievement.title}
                                      </p>
                                      <p className="text-xs text-gray-600 dark:text-gray-400">
                                        {achievement.description}
                                      </p>
                                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        {new Date(achievement.date).toLocaleDateString()}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                No achievements yet
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Notes */}
                      {member.notes && (
                        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                            Notes
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{member.notes}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Performance Tab */}
        {activeTab === 'performance' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Team Performance Overview */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Team Performance Overview
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      Team Efficiency
                    </span>
                    <span
                      className={`text-sm font-medium ${getPerformanceColor(team.metrics.efficiency)}`}
                    >
                      {team.metrics.efficiency}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${team.metrics.efficiency}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      Team Velocity
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {team.metrics.teamVelocity} points/sprint
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((team.metrics.teamVelocity / 60) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      Collaboration Score
                    </span>
                    <span
                      className={`text-sm font-medium ${getPerformanceColor(team.metrics.collaborationScore)}`}
                    >
                      {team.metrics.collaborationScore}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${team.metrics.collaborationScore}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Individual Performance */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Individual Performance
              </h3>
              <div className="space-y-3">
                {team.members.map(member => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={member.avatarUrl}
                        alt={member.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{member.name}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{member.role}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-sm font-medium ${getPerformanceColor(member.performance.efficiency)}`}
                      >
                        {member.performance.efficiency}%
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {member.performance.velocity} velocity
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Projects Tab */}
        {activeTab === 'projects' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {team.projects.map(project => (
              <div
                key={project.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {project.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Started: {new Date(project.startDate).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      project.status === 'completed'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                        : project.status === 'in-progress'
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                          : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                    }`}
                  >
                    {project.status}
                  </span>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      Progress
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {project.progress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>

                {project.endDate && (
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    End Date: {new Date(project.endDate).toLocaleDateString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Team Activity Feed
            </h3>
            <div className="space-y-4">
              {team.recentActivity.map(activity => (
                <div
                  key={activity.id}
                  className="flex items-start space-x-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  {getEventTypeIcon(activity.type)}
                  <div className="flex-1">
                    <p className="text-gray-900 dark:text-white">{activity.description}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {activity.userName} • {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamDetailPage;
