import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Copy,
  Clock,
  Repeat,
  Calendar,
  Zap,
  FileText,
  CheckCircle,
  Star,
  Users,
  Tag,
  Target,
  AlertCircle,
  Settings,
  Eye,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  MoreVertical,
} from 'lucide-react';

interface TaskTemplate {
  id: string;
  name: string;
  description: string;
  category: 'development' | 'design' | 'testing' | 'deployment' | 'maintenance' | 'custom';
  icon: string;
  isPublic: boolean;
  isFavorite: boolean;
  usageCount: number;
  createdBy: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
  template: {
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    estimatedHours: number;
    labels: string[];
    assigneeId?: string;
    subtasks: Array<{
      title: string;
      description: string;
      estimatedHours: number;
    }>;
    checklists: Array<{
      title: string;
      items: Array<{
        text: string;
        completed: boolean;
      }>;
    }>;
    attachments: Array<{
      name: string;
      url: string;
    }>;
    customFields: Record<string, any>;
  };
}

interface RecurringTask {
  id: string;
  name: string;
  description: string;
  templateId?: string;
  schedule: RecurringSchedule;
  nextRun: string;
  isActive: boolean;
  lastRun?: string;
  runCount: number;
  maxRuns?: number;
  createdBy: {
    id: string;
    name: string;
  };
  createdAt: string;
}

interface RecurringSchedule {
  type: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
  interval: number;
  daysOfWeek?: number[]; // 0-6 (Sunday-Saturday)
  dayOfMonth?: number; // 1-31
  endDate?: string;
  timezone: string;
}

interface TaskTemplatesProps {
  onTemplateSelect?: (template: TaskTemplate) => void;
  showRecurring?: boolean;
  allowCreate?: boolean;
  className?: string;
}

const TaskTemplates: React.FC<TaskTemplatesProps> = ({
  onTemplateSelect,
  showRecurring = true,
  allowCreate = true,
  className = '',
}) => {
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  const [recurringTasks, setRecurringTasks] = useState<RecurringTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'templates' | 'recurring'>('templates');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  const [isCreatingRecurring, setIsCreatingRecurring] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TaskTemplate | null>(null);
  const [editingRecurring, setEditingRecurring] = useState<RecurringTask | null>(null);

  // Mock data
  useEffect(() => {
    setTimeout(() => {
      const mockTemplates: TaskTemplate[] = [
        {
          id: 'template-1',
          name: 'Bug Report',
          description: 'Standard template for reporting and tracking bugs',
          category: 'development',
          icon: '🐛',
          isPublic: true,
          isFavorite: true,
          usageCount: 47,
          createdBy: {
            id: 'user-1',
            name: 'John Doe',
          },
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-10T00:00:00Z',
          template: {
            title: 'Bug: [Brief Description]',
            description:
              '**Environment:**\n- OS: \n- Browser: \n- Version: \n\n**Steps to Reproduce:**\n1. \n2. \n3. \n\n**Expected Behavior:**\n\n**Actual Behavior:**\n\n**Screenshots:**\n',
            priority: 'high',
            estimatedHours: 4,
            labels: ['bug', 'testing'],
            subtasks: [
              {
                title: 'Reproduce and verify bug',
                description: 'Confirm the bug exists and can be reproduced',
                estimatedHours: 1,
              },
              {
                title: 'Identify root cause',
                description: 'Investigate and identify the underlying cause',
                estimatedHours: 2,
              },
              {
                title: 'Fix and test',
                description: 'Implement fix and verify it works',
                estimatedHours: 3,
              },
            ],
            checklists: [
              {
                title: 'Bug Report Checklist',
                items: [
                  { text: 'Environment details provided', completed: false },
                  { text: 'Steps to reproduce are clear', completed: false },
                  { text: 'Expected vs actual behavior described', completed: false },
                  { text: 'Screenshots or video attached (if applicable)', completed: false },
                ],
              },
            ],
            attachments: [],
            customFields: {
              severity: 'medium',
              affectedUsers: 0,
              reproductionRate: 'always',
            },
          },
        },
        {
          id: 'template-2',
          name: 'Feature Development',
          description: 'Complete workflow for developing new features',
          category: 'development',
          icon: '✨',
          isPublic: true,
          isFavorite: false,
          usageCount: 23,
          createdBy: {
            id: 'user-2',
            name: 'Jane Smith',
          },
          createdAt: '2024-01-02T00:00:00Z',
          updatedAt: '2024-01-08T00:00:00Z',
          template: {
            title: 'Feature: [Feature Name]',
            description:
              '**User Story:**\nAs a [user type], I want [feature] so that [benefit].\n\n**Acceptance Criteria:**\n- [ ] \n- [ ] \n- [ ] \n\n**Technical Requirements:**\n\n**Dependencies:**',
            priority: 'medium',
            estimatedHours: 16,
            labels: ['feature', 'development'],
            subtasks: [
              {
                title: 'Design and planning',
                description: 'Create technical design and implementation plan',
                estimatedHours: 4,
              },
              {
                title: 'Implementation',
                description: 'Write the actual code',
                estimatedHours: 8,
              },
              {
                title: 'Code review',
                description: 'Get code reviewed and incorporate feedback',
                estimatedHours: 2,
              },
              {
                title: 'Testing',
                description: 'Write and run tests',
                estimatedHours: 2,
              },
            ],
            checklists: [
              {
                title: 'Pre-development',
                items: [
                  { text: 'Requirements are clear', completed: false },
                  { text: 'Technical design approved', completed: false },
                  { text: 'Dependencies identified', completed: false },
                ],
              },
              {
                title: 'Pre-release',
                items: [
                  { text: 'Code reviewed', completed: false },
                  { text: 'Tests passing', completed: false },
                  { text: 'Documentation updated', completed: false },
                ],
              },
            ],
            attachments: [],
            customFields: {
              complexity: 'medium',
              riskLevel: 'low',
            },
          },
        },
        {
          id: 'template-3',
          name: 'Code Review',
          description: 'Template for code review tasks',
          category: 'development',
          icon: '👀',
          isPublic: true,
          isFavorite: false,
          usageCount: 31,
          createdBy: {
            id: 'user-3',
            name: 'Alice Johnson',
          },
          createdAt: '2024-01-03T00:00:00Z',
          updatedAt: '2024-01-05T00:00:00Z',
          template: {
            title: 'Code Review: [PR/Commit Title]',
            description:
              '**Pull Request:** [Link]\n\n**Review Focus:**\n- Code quality and style\n- Logic and functionality\n- Performance considerations\n- Security implications\n\n**Reviewer Checklist:**',
            priority: 'medium',
            estimatedHours: 2,
            labels: ['review', 'quality'],
            subtasks: [
              {
                title: 'Review code changes',
                description: 'Go through all code changes',
                estimatedHours: 1,
              },
              {
                title: 'Test functionality',
                description: 'Test the changes if possible',
                estimatedHours: 0.5,
              },
              {
                title: 'Provide feedback',
                description: 'Leave detailed review comments',
                estimatedHours: 0.5,
              },
            ],
            checklists: [
              {
                title: 'Review Checklist',
                items: [
                  { text: 'Code follows style guidelines', completed: false },
                  { text: 'No obvious bugs or issues', completed: false },
                  { text: 'Tests are included and passing', completed: false },
                  { text: 'Documentation is updated', completed: false },
                ],
              },
            ],
            attachments: [],
            customFields: {
              reviewType: 'feature',
              prLink: '',
            },
          },
        },
        {
          id: 'template-4',
          name: 'Sprint Planning',
          description: 'Template for sprint planning meetings and tasks',
          category: 'development',
          icon: '📋',
          isPublic: true,
          isFavorite: false,
          usageCount: 12,
          createdBy: {
            id: 'user-4',
            name: 'Bob Wilson',
          },
          createdAt: '2024-01-04T00:00:00Z',
          updatedAt: '2024-01-06T00:00:00Z',
          template: {
            title: 'Sprint Planning - [Sprint Name]',
            description:
              '**Sprint Goal:**\n\n**Sprint Duration:**\n\n**Capacity:**\n- Team members: \n- Available hours: \n\n**Stories to Consider:**',
            priority: 'high',
            estimatedHours: 4,
            labels: ['planning', 'sprint'],
            subtasks: [
              {
                title: 'Review previous sprint',
                description: "Analyze what went well and what didn't",
                estimatedHours: 1,
              },
              {
                title: 'Select stories',
                description: 'Choose stories for this sprint',
                estimatedHours: 2,
              },
              {
                title: 'Create sprint board',
                description: 'Set up the sprint board and assign tasks',
                estimatedHours: 1,
              },
            ],
            checklists: [
              {
                title: 'Planning Checklist',
                items: [
                  { text: 'Sprint goal defined', completed: false },
                  { text: 'Team capacity confirmed', completed: false },
                  { text: 'Stories estimated', completed: false },
                  { text: 'Dependencies identified', completed: false },
                ],
              },
            ],
            attachments: [],
            customFields: {
              sprintNumber: '',
              teamVelocity: '',
            },
          },
        },
        {
          id: 'template-5',
          name: 'User Testing',
          description: 'Template for user testing and feedback collection',
          category: 'testing',
          icon: '🧪',
          isPublic: true,
          isFavorite: false,
          usageCount: 8,
          createdBy: {
            id: 'user-5',
            name: 'Carol Davis',
          },
          createdAt: '2024-01-05T00:00:00Z',
          updatedAt: '2024-01-07T00:00:00Z',
          template: {
            title: 'User Testing: [Feature/Module]',
            description:
              '**Test Scenario:**\n\n**Target Users:**\n\n**Test Goals:**\n\n**Success Criteria:**',
            priority: 'medium',
            estimatedHours: 6,
            labels: ['testing', 'ux'],
            subtasks: [
              {
                title: 'Prepare test plan',
                description: 'Create detailed test scenarios',
                estimatedHours: 2,
              },
              {
                title: 'Recruit test users',
                description: 'Find and schedule test participants',
                estimatedHours: 1,
              },
              {
                title: 'Conduct testing',
                description: 'Run the actual user testing sessions',
                estimatedHours: 2,
              },
              {
                title: 'Analyze results',
                description: 'Compile and analyze test results',
                estimatedHours: 1,
              },
            ],
            checklists: [
              {
                title: 'Test Preparation',
                items: [
                  { text: 'Test environment ready', completed: false },
                  { text: 'Test scenarios documented', completed: false },
                  { text: 'Consent forms prepared', completed: false },
                  { text: 'Recording tools set up', completed: false },
                ],
              },
            ],
            attachments: [],
            customFields: {
              testType: 'usability',
              participantCount: 5,
            },
          },
        },
      ];

      const mockRecurringTasks: RecurringTask[] = [
        {
          id: 'recurring-1',
          name: 'Weekly Code Review',
          description: 'Review all code changes from the past week',
          templateId: 'template-3',
          schedule: {
            type: 'weekly',
            interval: 1,
            daysOfWeek: [5], // Friday
            timezone: 'America/New_York',
          },
          nextRun: '2024-01-19T09:00:00Z',
          isActive: true,
          lastRun: '2024-01-12T09:00:00Z',
          runCount: 8,
          createdBy: {
            id: 'user-2',
            name: 'Jane Smith',
          },
          createdAt: '2023-12-01T00:00:00Z',
        },
        {
          id: 'recurring-2',
          name: 'Monthly Performance Review',
          description: 'Analyze and optimize system performance',
          schedule: {
            type: 'monthly',
            interval: 1,
            dayOfMonth: 1,
            timezone: 'America/New_York',
          },
          nextRun: '2024-02-01T10:00:00Z',
          isActive: true,
          lastRun: '2024-01-01T10:00:00Z',
          runCount: 3,
          createdBy: {
            id: 'user-1',
            name: 'John Doe',
          },
          createdAt: '2023-10-01T00:00:00Z',
        },
        {
          id: 'recurring-3',
          name: 'Daily Standup',
          description: 'Daily team standup meeting',
          schedule: {
            type: 'daily',
            interval: 1,
            timezone: 'America/New_York',
          },
          nextRun: '2024-01-16T09:00:00Z',
          isActive: true,
          lastRun: '2024-01-15T09:00:00Z',
          runCount: 45,
          createdBy: {
            id: 'user-3',
            name: 'Alice Johnson',
          },
          createdAt: '2023-11-01T00:00:00Z',
        },
      ];

      setTemplates(mockTemplates);
      setRecurringTasks(mockRecurringTasks);
      setIsLoading(false);
    }, 500);
  }, []);

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'development', label: 'Development' },
    { value: 'design', label: 'Design' },
    { value: 'testing', label: 'Testing' },
    { value: 'deployment', label: 'Deployment' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'custom', label: 'Custom' },
  ];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const useTemplate = (template: TaskTemplate) => {
    onTemplateSelect?.(template);
  };

  const toggleFavorite = (templateId: string) => {
    setTemplates(
      templates.map(t => (t.id === templateId ? { ...t, isFavorite: !t.isFavorite } : t))
    );
  };

  const duplicateTemplate = (template: TaskTemplate) => {
    const duplicated: TaskTemplate = {
      ...template,
      id: `template-${Date.now()}`,
      name: `${template.name} (Copy)`,
      usageCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTemplates([...templates, duplicated]);
  };

  const deleteTemplate = (templateId: string) => {
    setTemplates(templates.filter(t => t.id !== templateId));
  };

  const getScheduleText = (schedule: RecurringSchedule) => {
    switch (schedule.type) {
      case 'daily':
        return `Every ${schedule.interval === 1 ? 'day' : `${schedule.interval} days`}`;
      case 'weekly':
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const dayNames = schedule.daysOfWeek?.map(d => days[d]).join(', ') || '';
        return `Every ${schedule.interval === 1 ? 'week' : `${schedule.interval} weeks`} on ${dayNames}`;
      case 'monthly':
        return `Every ${schedule.interval === 1 ? 'month' : `${schedule.interval} months`} on day ${schedule.dayOfMonth}`;
      case 'yearly':
        return `Every ${schedule.interval === 1 ? 'year' : `${schedule.interval} years`}`;
      default:
        return 'Custom schedule';
    }
  };

  const getNextRunText = (nextRun: string) => {
    const date = new Date(nextRun);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days < 0) return 'Overdue';
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    if (days < 7) return `In ${days} days`;
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Task Templates & Automation
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Streamline task creation with templates and recurring tasks
            </p>
          </div>

          {allowCreate && (
            <div className="flex items-center space-x-2">
              {activeTab === 'templates' ? (
                <button
                  onClick={() => setIsCreatingTemplate(true)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Template
                </button>
              ) : (
                <button
                  onClick={() => setIsCreatingRecurring(true)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Recurring
                </button>
              )}
            </div>
          )}
        </div>

        {/* Tabs */}
        {showRecurring && (
          <div className="flex items-center space-x-6 mt-6">
            <button
              onClick={() => setActiveTab('templates')}
              className={`pb-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'templates'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>Templates ({templates.length})</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('recurring')}
              className={`pb-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'recurring'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Repeat className="w-4 h-4" />
                <span>Recurring Tasks ({recurringTasks.length})</span>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="p-6">
          {/* Filters */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map(template => (
              <div
                key={template.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{template.icon}</span>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">{template.name}</h3>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {template.category}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => toggleFavorite(template.id)}
                      className="p-1 text-gray-400 hover:text-yellow-500 transition-colors"
                    >
                      <Star
                        className={`w-4 h-4 ${template.isFavorite ? 'fill-yellow-500 text-yellow-500' : ''}`}
                      />
                    </button>
                    <div className="relative">
                      <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {template.description}
                </p>

                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
                  <span>Used {template.usageCount} times</span>
                  <span>by {template.createdBy.name}</span>
                </div>

                <div className="flex items-center space-x-2 mb-4">
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs">
                    {template.template.subtasks.length} subtasks
                  </span>
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded text-xs">
                    {template.template.estimatedHours}h estimated
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => useTemplate(template)}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    Use Template
                  </button>
                  <button
                    onClick={() => duplicateTemplate(template)}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {searchQuery || selectedCategory !== 'all'
                  ? 'No templates match your filters'
                  : 'No templates created yet'}
              </p>
              {allowCreate && (
                <button
                  onClick={() => setIsCreatingTemplate(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Your First Template
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Recurring Tasks Tab */}
      {activeTab === 'recurring' && (
        <div className="p-6">
          <div className="space-y-4">
            {recurringTasks.map(task => (
              <div
                key={task.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-medium text-gray-900 dark:text-white">{task.name}</h3>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${
                          task.isActive
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                        }`}
                      >
                        {task.isActive ? 'Active' : 'Paused'}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {task.description}
                    </p>

                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Repeat className="w-4 h-4" />
                        <span>{getScheduleText(task.schedule)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{getNextRunText(task.nextRun)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Zap className="w-4 h-4" />
                        <span>Run {task.runCount} times</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {recurringTasks.length === 0 && (
              <div className="text-center py-12">
                <Repeat className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  No recurring tasks configured yet
                </p>
                {allowCreate && (
                  <button
                    onClick={() => setIsCreatingRecurring(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create Recurring Task
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskTemplates;
