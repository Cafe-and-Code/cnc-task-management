import React, { useState, useEffect } from 'react';
import {
  Save,
  X,
  Users,
  Plus,
  Trash2,
  Upload,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Calendar,
  MapPin,
  Mail,
  Phone,
  Settings,
  Shield,
  Target,
  Award,
  Star,
  Briefcase,
  UserPlus,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Info,
} from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  isLead: boolean;
}

interface Team {
  id?: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'archived';
  department: string;
  leadId: string;
  members: TeamMember[];
  tags: string[];
  avatar?: string;
  settings: {
    isPublic: boolean;
    allowMemberInvite: boolean;
    requireApprovalForJoin: boolean;
    defaultWorkingHours: {
      start: string;
      end: string;
    };
    timezone: string;
    communicationChannels: string[];
    meetingSchedule: {
      frequency: 'daily' | 'weekly' | 'bi-weekly' | 'monthly';
      dayOfWeek?: number;
      time: string;
    };
  };
  goals: Array<{
    id: string;
    title: string;
    description: string;
    dueDate: string;
    priority: 'low' | 'medium' | 'high';
    status: 'active' | 'completed' | 'paused';
  }>;
}

interface TeamFormProps {
  team?: Team;
  onSave: (team: Team) => void;
  onCancel: () => void;
  isLoading?: boolean;
  mode: 'create' | 'edit';
}

const TeamForm: React.FC<TeamFormProps> = ({ team, onSave, onCancel, isLoading = false, mode }) => {
  const [formData, setFormData] = useState<Team>({
    name: '',
    description: '',
    status: 'active',
    department: '',
    leadId: '',
    members: [],
    tags: [],
    settings: {
      isPublic: false,
      allowMemberInvite: true,
      requireApprovalForJoin: false,
      defaultWorkingHours: {
        start: '09:00',
        end: '17:00',
      },
      timezone: 'UTC',
      communicationChannels: ['Slack'],
      meetingSchedule: {
        frequency: 'weekly',
        dayOfWeek: 1,
        time: '10:00',
      },
    },
    goals: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [newMember, setNewMember] = useState<Partial<TeamMember>>({
    name: '',
    email: '',
    role: '',
    department: '',
    isLead: false,
  });
  const [tagInput, setTagInput] = useState('');
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
  });

  // Available options
  const departments = [
    'Engineering',
    'Design',
    'Product',
    'Marketing',
    'Sales',
    'Support',
    'HR',
    'Finance',
    'Operations',
  ];

  const roles = [
    'Team Lead',
    'Senior Developer',
    'Developer',
    'Junior Developer',
    'UI/UX Designer',
    'Product Manager',
    'QA Engineer',
    'DevOps Engineer',
    'Data Analyst',
    'Business Analyst',
  ];

  const communicationChannels = [
    'Slack',
    'Microsoft Teams',
    'Email',
    'Zoom',
    'Google Meet',
    'Discord',
    'Jira',
    'Confluence',
  ];

  const timezones = [
    'UTC',
    'PST (UTC-8)',
    'MST (UTC-7)',
    'CST (UTC-6)',
    'EST (UTC-5)',
    'GMT (UTC+0)',
    'CET (UTC+1)',
    'IST (UTC+5:30)',
    'JST (UTC+9)',
    'AEST (UTC+10)',
  ];

  useEffect(() => {
    if (team && mode === 'edit') {
      setFormData(team);
    }
  }, [team, mode]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Team name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.department) {
      newErrors.department = 'Department is required';
    }

    if (!formData.leadId) {
      newErrors.leadId = 'Team lead is required';
    }

    if (formData.members.length === 0) {
      newErrors.members = 'At least one team member is required';
    }

    const lead = formData.members.find(m => m.id === formData.leadId);
    if (!lead) {
      newErrors.leadId = 'Team lead must be a team member';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  const addMember = () => {
    if (!newMember.name?.trim() || !newMember.email?.trim() || !newMember.role?.trim()) {
      setErrors({ ...errors, memberForm: 'Please fill in all member fields' });
      return;
    }

    const member: TeamMember = {
      id: `member-${Date.now()}`,
      name: newMember.name,
      email: newMember.email,
      role: newMember.role,
      department: newMember.department || formData.department,
      isLead: newMember.isLead || false,
    };

    if (newMember.isLead) {
      // Unset previous lead if exists
      const updatedMembers = formData.members.map(m => ({ ...m, isLead: false }));
      setFormData({
        ...formData,
        members: [...updatedMembers, member],
        leadId: member.id,
      });
    } else {
      setFormData({
        ...formData,
        members: [...formData.members, member],
      });
    }

    setNewMember({
      name: '',
      email: '',
      role: '',
      department: '',
      isLead: false,
    });
    setShowMemberForm(false);
    delete errors.memberForm;
  };

  const updateMember = (memberId: string, updates: Partial<TeamMember>) => {
    const updatedMembers = formData.members.map(m =>
      m.id === memberId ? { ...m, ...updates } : m
    );

    if (updates.isLead) {
      // Unset previous lead
      const allMembers = updatedMembers.map(m => ({ ...m, isLead: m.id === memberId }));
      setFormData({
        ...formData,
        members: allMembers,
        leadId: memberId,
      });
    } else {
      setFormData({
        ...formData,
        members: updatedMembers,
      });
    }
  };

  const removeMember = (memberId: string) => {
    const updatedMembers = formData.members.filter(m => m.id !== memberId);
    setFormData({
      ...formData,
      members: updatedMembers,
      leadId: formData.leadId === memberId ? '' : formData.leadId,
    });
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      });
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove),
    });
  };

  const addGoal = () => {
    if (!newGoal.title.trim()) {
      setErrors({ ...errors, goalForm: 'Goal title is required' });
      return;
    }

    const goal = {
      id: `goal-${Date.now()}`,
      title: newGoal.title,
      description: newGoal.description,
      dueDate: newGoal.dueDate,
      priority: newGoal.priority,
      status: 'active' as const,
    };

    setFormData({
      ...formData,
      goals: [...formData.goals, goal],
    });

    setNewGoal({
      title: '',
      description: '',
      dueDate: '',
      priority: 'medium',
    });
    setShowGoalForm(false);
    delete errors.goalForm;
  };

  const removeGoal = (goalId: string) => {
    setFormData({
      ...formData,
      goals: formData.goals.filter(g => g.id !== goalId),
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {mode === 'create' ? 'Create New Team' : 'Edit Team'}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {mode === 'create'
              ? 'Set up a new team with members and goals'
              : 'Update team information and settings'}
          </p>
        </div>

        <button
          onClick={onCancel}
          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        {/* Basic Information */}
        <div className="space-y-6 mb-8">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Team Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Enter team name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Department *
                </label>
                <select
                  value={formData.department}
                  onChange={e => setFormData({ ...formData, department: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    errors.department ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                >
                  <option value="">Select department</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
                {errors.department && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.department}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Describe the team's purpose and responsibilities"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.description}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Team Avatar
                </label>
                <div className="flex items-center space-x-3">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                    {formData.name.charAt(0) || 'T'}
                  </div>
                  <button
                    type="button"
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Avatar
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tags
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Add tags..."
              />
              <button
                type="button"
                onClick={addTag}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add
              </button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-2 text-blue-500 hover:text-blue-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Team Members */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Team Members</h3>
            <button
              type="button"
              onClick={() => setShowMemberForm(true)}
              className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Member
            </button>
          </div>

          {errors.members && (
            <p className="mb-4 text-sm text-red-600 dark:text-red-400">{errors.members}</p>
          )}

          {formData.members.length > 0 ? (
            <div className="space-y-3">
              {formData.members.map(member => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-medium text-gray-900 dark:text-white">{member.name}</p>
                        {member.isLead && (
                          <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded text-xs">
                            Lead
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {member.role} • {member.department}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{member.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setEditingMember(member)}
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeMember(member.id)}
                      className="p-2 text-red-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No team members added yet</p>
            </div>
          )}

          {errors.leadId && (
            <p className="mt-4 text-sm text-red-600 dark:text-red-400">{errors.leadId}</p>
          )}
        </div>

        {/* Add Member Form */}
        {showMemberForm && (
          <div className="mb-8 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
              Add Team Member
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={newMember.name || ''}
                  onChange={e => setNewMember({ ...newMember, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={newMember.email || ''}
                  onChange={e => setNewMember({ ...newMember, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Role *
                </label>
                <select
                  value={newMember.role || ''}
                  onChange={e => setNewMember({ ...newMember, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select role</option>
                  {roles.map(role => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Department
                </label>
                <select
                  value={newMember.department || ''}
                  onChange={e => setNewMember({ ...newMember, department: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Same as team</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={newMember.isLead || false}
                    onChange={e => setNewMember({ ...newMember, isLead: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Set as Team Lead</span>
                </label>
              </div>
            </div>

            {errors.memberForm && (
              <p className="mt-4 text-sm text-red-600 dark:text-red-400">{errors.memberForm}</p>
            )}

            <div className="flex items-center space-x-3 mt-4">
              <button
                type="button"
                onClick={addMember}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Member
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowMemberForm(false);
                  setNewMember({
                    name: '',
                    email: '',
                    role: '',
                    department: '',
                    isLead: false,
                  });
                  delete errors.memberForm;
                }}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Team Goals */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Team Goals</h3>
            <button
              type="button"
              onClick={() => setShowGoalForm(true)}
              className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Target className="w-4 h-4 mr-2" />
              Add Goal
            </button>
          </div>

          {formData.goals.length > 0 ? (
            <div className="space-y-3">
              {formData.goals.map(goal => (
                <div
                  key={goal.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="font-medium text-gray-900 dark:text-white">{goal.title}</p>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          goal.priority === 'high'
                            ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                            : goal.priority === 'medium'
                              ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                              : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                        }`}
                      >
                        {goal.priority}
                      </span>
                    </div>
                    {goal.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {goal.description}
                      </p>
                    )}
                    {goal.dueDate && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Due: {new Date(goal.dueDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => removeGoal(goal.id)}
                    className="p-2 text-red-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No team goals defined yet</p>
            </div>
          )}
        </div>

        {/* Add Goal Form */}
        {showGoalForm && (
          <div className="mb-8 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
              Add Team Goal
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Goal Title *
                </label>
                <input
                  type="text"
                  value={newGoal.title}
                  onChange={e => setNewGoal({ ...newGoal, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter goal title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Priority
                </label>
                <select
                  value={newGoal.priority}
                  onChange={e => setNewGoal({ ...newGoal, priority: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={newGoal.description}
                  onChange={e => setNewGoal({ ...newGoal, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Describe the goal and success criteria"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={newGoal.dueDate}
                  onChange={e => setNewGoal({ ...newGoal, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {errors.goalForm && (
              <p className="mt-4 text-sm text-red-600 dark:text-red-400">{errors.goalForm}</p>
            )}

            <div className="flex items-center space-x-3 mt-4">
              <button
                type="button"
                onClick={addGoal}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Goal
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowGoalForm(false);
                  setNewGoal({
                    title: '',
                    description: '',
                    dueDate: '',
                    priority: 'medium',
                  });
                  delete errors.goalForm;
                }}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Advanced Settings Toggle */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
          >
            {showAdvanced ? (
              <ChevronUp className="w-4 h-4 mr-2" />
            ) : (
              <ChevronDown className="w-4 h-4 mr-2" />
            )}
            {showAdvanced ? 'Hide' : 'Show'} Advanced Settings
          </button>
        </div>

        {/* Advanced Settings */}
        {showAdvanced && (
          <div className="space-y-6 mb-8 p-6 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Advanced Settings
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Privacy Settings */}
              <div>
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                  Privacy Settings
                </h4>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.settings.isPublic}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          settings: { ...formData.settings, isPublic: e.target.checked },
                        })
                      }
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Public team (visible to all organization members)
                    </span>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.settings.allowMemberInvite}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          settings: { ...formData.settings, allowMemberInvite: e.target.checked },
                        })
                      }
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Allow members to invite others
                    </span>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.settings.requireApprovalForJoin}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          settings: {
                            ...formData.settings,
                            requireApprovalForJoin: e.target.checked,
                          },
                        })
                      }
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Require approval for new members
                    </span>
                  </label>
                </div>
              </div>

              {/* Working Hours */}
              <div>
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                  Working Hours
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Timezone
                    </label>
                    <select
                      value={formData.settings.timezone}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          settings: { ...formData.settings, timezone: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      {timezones.map(tz => (
                        <option key={tz} value={tz}>
                          {tz}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Start Time
                      </label>
                      <input
                        type="time"
                        value={formData.settings.defaultWorkingHours.start}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            settings: {
                              ...formData.settings,
                              defaultWorkingHours: {
                                ...formData.settings.defaultWorkingHours,
                                start: e.target.value,
                              },
                            },
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        End Time
                      </label>
                      <input
                        type="time"
                        value={formData.settings.defaultWorkingHours.end}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            settings: {
                              ...formData.settings,
                              defaultWorkingHours: {
                                ...formData.settings.defaultWorkingHours,
                                end: e.target.value,
                              },
                            },
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Communication */}
              <div>
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                  Communication Channels
                </h4>
                <div className="space-y-2">
                  {communicationChannels.map(channel => (
                    <label key={channel} className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={formData.settings.communicationChannels.includes(channel)}
                        onChange={e => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              settings: {
                                ...formData.settings,
                                communicationChannels: [
                                  ...formData.settings.communicationChannels,
                                  channel,
                                ],
                              },
                            });
                          } else {
                            setFormData({
                              ...formData,
                              settings: {
                                ...formData.settings,
                                communicationChannels:
                                  formData.settings.communicationChannels.filter(
                                    c => c !== channel
                                  ),
                              },
                            });
                          }
                        }}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{channel}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Meeting Schedule */}
              <div>
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                  Meeting Schedule
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Frequency
                    </label>
                    <select
                      value={formData.settings.meetingSchedule.frequency}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          settings: {
                            ...formData.settings,
                            meetingSchedule: {
                              ...formData.settings.meetingSchedule,
                              frequency: e.target.value as any,
                            },
                          },
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="bi-weekly">Bi-weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>

                  {(formData.settings.meetingSchedule.frequency === 'weekly' ||
                    formData.settings.meetingSchedule.frequency === 'bi-weekly') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Day of Week
                      </label>
                      <select
                        value={formData.settings.meetingSchedule.dayOfWeek || 1}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            settings: {
                              ...formData.settings,
                              meetingSchedule: {
                                ...formData.settings.meetingSchedule,
                                dayOfWeek: parseInt(e.target.value),
                              },
                            },
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value={1}>Monday</option>
                        <option value={2}>Tuesday</option>
                        <option value={3}>Wednesday</option>
                        <option value={4}>Thursday</option>
                        <option value={5}>Friday</option>
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Meeting Time
                    </label>
                    <input
                      type="time"
                      value={formData.settings.meetingSchedule.time}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          settings: {
                            ...formData.settings,
                            meetingSchedule: {
                              ...formData.settings.meetingSchedule,
                              time: e.target.value,
                            },
                          },
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                {mode === 'create' ? 'Creating...' : 'Updating...'}
              </div>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {mode === 'create' ? 'Create Team' : 'Update Team'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TeamForm;
