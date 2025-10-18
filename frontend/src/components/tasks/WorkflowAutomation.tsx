import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Play,
  Pause,
  Settings,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
  Code,
  Bell,
  Users,
  Calendar,
  Filter,
  ArrowRight,
  Copy,
  Eye,
  EyeOff,
  RefreshCw,
} from 'lucide-react';

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  trigger: AutomationTrigger;
  conditions: AutomationCondition[];
  actions: AutomationAction[];
  executionCount: number;
  lastExecuted?: string;
  createdAt: string;
  updatedAt: string;
}

interface AutomationTrigger {
  type:
    | 'task_created'
    | 'task_updated'
    | 'status_changed'
    | 'field_changed'
    | 'time_based'
    | 'manual'
    | 'webhook';
  config: Record<string, any>;
}

interface AutomationCondition {
  id: string;
  type: 'field' | 'status' | 'assignee' | 'label' | 'dependency' | 'custom';
  field?: string;
  operator:
    | 'equals'
    | 'not_equals'
    | 'contains'
    | 'not_contains'
    | 'greater_than'
    | 'less_than'
    | 'is_empty'
    | 'is_not_empty'
    | 'in'
    | 'not_in';
  value?: any;
  description: string;
}

interface AutomationAction {
  id: string;
  type:
    | 'update_status'
    | 'update_field'
    | 'send_notification'
    | 'assign_user'
    | 'create_task'
    | 'send_email'
    | 'webhook'
    | 'custom_script';
  config: Record<string, any>;
  description: string;
}

interface WorkflowAutomationProps {
  taskId?: string;
  onRuleChange?: (rule: AutomationRule) => void;
  className?: string;
}

const WorkflowAutomation: React.FC<WorkflowAutomationProps> = ({
  taskId,
  onRuleChange,
  className = '',
}) => {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingRule, setEditingRule] = useState<AutomationRule | null>(null);
  const [testMode, setTestMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data
  useEffect(() => {
    setTimeout(() => {
      const mockRules: AutomationRule[] = [
        {
          id: 'auto-assign-on-create',
          name: 'Auto-assign on Create',
          description: 'Automatically assign new tasks to the project lead',
          isActive: true,
          trigger: {
            type: 'task_created',
            config: {
              projectTypes: ['development', 'design'],
            },
          },
          conditions: [
            {
              id: 'cond-1',
              type: 'field',
              field: 'priority',
              operator: 'equals',
              value: 'high',
              description: 'Task priority is high',
            },
          ],
          actions: [
            {
              id: 'act-1',
              type: 'assign_user',
              config: {
                userId: 'project-lead',
                notify: true,
              },
              description: 'Assign to project lead',
            },
          ],
          executionCount: 47,
          lastExecuted: '2024-01-15T10:30:00Z',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-10T00:00:00Z',
        },
        {
          id: 'move-to-review-when-complete',
          name: 'Move to Review When Complete',
          description: 'Automatically move tasks to review status when all subtasks are complete',
          isActive: true,
          trigger: {
            type: 'field_changed',
            config: {
              field: 'subtasks',
            },
          },
          conditions: [
            {
              id: 'cond-2',
              type: 'custom',
              operator: 'equals',
              value: true,
              description: 'All subtasks are completed',
            },
          ],
          actions: [
            {
              id: 'act-2',
              type: 'update_status',
              config: {
                status: 'review',
              },
              description: 'Move to review status',
            },
            {
              id: 'act-3',
              type: 'send_notification',
              config: {
                recipients: ['assignee', 'project-lead'],
                message: 'Task is ready for review',
              },
              description: 'Notify team members',
            },
          ],
          executionCount: 23,
          lastExecuted: '2024-01-14T15:45:00Z',
          createdAt: '2024-01-05T00:00:00Z',
          updatedAt: '2024-01-05T00:00:00Z',
        },
        {
          id: 'daily-reminder-for-overdue',
          name: 'Daily Reminder for Overdue Tasks',
          description: 'Send daily reminders for tasks that are overdue',
          isActive: true,
          trigger: {
            type: 'time_based',
            config: {
              schedule: '0 9 * * *', // Daily at 9 AM
              timezone: 'UTC',
            },
          },
          conditions: [
            {
              id: 'cond-3',
              type: 'field',
              field: 'dueDate',
              operator: 'less_than',
              value: new Date().toISOString(),
              description: 'Task is overdue',
            },
            {
              id: 'cond-4',
              type: 'status',
              operator: 'not_in',
              value: ['done', 'cancelled'],
              description: 'Task is not completed',
            },
          ],
          actions: [
            {
              id: 'act-4',
              type: 'send_email',
              config: {
                to: 'assignee',
                template: 'overdue-reminder',
                includeProjectLead: true,
              },
              description: 'Send reminder email',
            },
          ],
          executionCount: 156,
          lastExecuted: '2024-01-15T09:00:00Z',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-12T00:00:00Z',
        },
        {
          id: 'create-followup-task',
          name: 'Create Follow-up Task',
          description: 'Create a follow-up task when bugs are resolved',
          isActive: false,
          trigger: {
            type: 'status_changed',
            config: {
              fromStatus: 'in-progress',
              toStatus: 'done',
            },
          },
          conditions: [
            {
              id: 'cond-5',
              type: 'label',
              operator: 'contains',
              value: 'bug',
              description: 'Task has bug label',
            },
          ],
          actions: [
            {
              id: 'act-5',
              type: 'create_task',
              config: {
                title: 'Test fix for {{parent.title}}',
                description: 'Verify that the fix for {{parent.title}} is working correctly',
                assignTo: 'tester',
                labels: ['testing', 'verification'],
                dueInDays: 3,
              },
              description: 'Create verification task',
            },
          ],
          executionCount: 12,
          lastExecuted: '2024-01-10T14:20:00Z',
          createdAt: '2024-01-08T00:00:00Z',
          updatedAt: '2024-01-08T00:00:00Z',
        },
      ];

      setRules(mockRules);
      setIsLoading(false);
    }, 500);
  }, []);

  const createRule = () => {
    const newRule: AutomationRule = {
      id: `rule-${Date.now()}`,
      name: 'New Automation Rule',
      description: '',
      isActive: false,
      trigger: {
        type: 'manual',
        config: {},
      },
      conditions: [],
      actions: [],
      executionCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setRules([...rules, newRule]);
    setEditingRule(newRule);
    setIsCreating(false);
  };

  const updateRule = (updatedRule: AutomationRule) => {
    setRules(rules.map(r => (r.id === updatedRule.id ? updatedRule : r)));
    onRuleChange?.(updatedRule);
    setEditingRule(null);
  };

  const deleteRule = (ruleId: string) => {
    setRules(rules.filter(r => r.id !== ruleId));
  };

  const toggleRule = (ruleId: string) => {
    setRules(rules.map(r => (r.id === ruleId ? { ...r, isActive: !r.isActive } : r)));
  };

  const testRule = (rule: AutomationRule) => {
    setTestMode(true);
    // In real implementation, test the rule with mock data
    setTimeout(() => {
      setTestMode(false);
      alert('Rule test completed successfully');
    }, 2000);
  };

  const duplicateRule = (rule: AutomationRule) => {
    const duplicated: AutomationRule = {
      ...rule,
      id: `rule-${Date.now()}`,
      name: `${rule.name} (Copy)`,
      executionCount: 0,
      lastExecuted: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setRules([...rules, duplicated]);
  };

  const getTriggerIcon = (triggerType: string) => {
    switch (triggerType) {
      case 'task_created':
        return <Plus className="w-4 h-4" />;
      case 'task_updated':
        return <Edit2 className="w-4 h-4" />;
      case 'status_changed':
        return <ArrowRight className="w-4 h-4" />;
      case 'time_based':
        return <Clock className="w-4 h-4" />;
      case 'manual':
        return <Play className="w-4 h-4" />;
      default:
        return <Zap className="w-4 h-4" />;
    }
  };

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'update_status':
        return <ArrowRight className="w-4 h-4" />;
      case 'send_notification':
        return <Bell className="w-4 h-4" />;
      case 'assign_user':
        return <Users className="w-4 h-4" />;
      case 'create_task':
        return <Plus className="w-4 h-4" />;
      case 'send_email':
        return <Bell className="w-4 h-4" />;
      case 'custom_script':
        return <Code className="w-4 h-4" />;
      default:
        return <Settings className="w-4 h-4" />;
    }
  };

  const getTriggerName = (triggerType: string) => {
    switch (triggerType) {
      case 'task_created':
        return 'Task Created';
      case 'task_updated':
        return 'Task Updated';
      case 'status_changed':
        return 'Status Changed';
      case 'field_changed':
        return 'Field Changed';
      case 'time_based':
        return 'Time Based';
      case 'manual':
        return 'Manual';
      case 'webhook':
        return 'Webhook';
      default:
        return triggerType;
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
        <div className="space-y-4">
          <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
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
              Workflow Automation
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Configure rules to automate task workflows and notifications
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsCreating(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Rule
            </button>
          </div>
        </div>
      </div>

      {/* Rules List */}
      <div className="p-6">
        <div className="space-y-4">
          {rules.map(rule => (
            <div
              key={rule.id}
              className={`border rounded-lg p-4 transition-colors ${
                rule.isActive
                  ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10'
                  : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-medium text-gray-900 dark:text-white">{rule.name}</h3>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${
                        rule.isActive
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      {rule.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {rule.description}
                  </p>

                  {/* Trigger */}
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="flex items-center space-x-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs">
                      {getTriggerIcon(rule.trigger.type)}
                      <span>{getTriggerName(rule.trigger.type)}</span>
                    </div>
                    <ArrowRight className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {rule.conditions.length} condition{rule.conditions.length !== 1 ? 's' : ''}
                    </span>
                    <ArrowRight className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {rule.actions.length} action{rule.actions.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Actions Preview */}
                  <div className="flex flex-wrap gap-1">
                    {rule.actions.slice(0, 3).map(action => (
                      <div
                        key={action.id}
                        className="flex items-center space-x-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs"
                      >
                        {getActionIcon(action.type)}
                        <span>{action.description}</span>
                      </div>
                    ))}
                    {rule.actions.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs">
                        +{rule.actions.length - 3} more
                      </span>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
                    <span>Executed {rule.executionCount} times</span>
                    {rule.lastExecuted && (
                      <span>Last: {new Date(rule.lastExecuted).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-1 ml-4">
                  <button
                    onClick={() => toggleRule(rule.id)}
                    className={`p-2 rounded transition-colors ${
                      rule.isActive
                        ? 'text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300'
                        : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                    }`}
                  >
                    {rule.isActive ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => testRule(rule)}
                    disabled={testMode}
                    className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    <RefreshCw className={`w-4 h-4 ${testMode ? 'animate-spin' : ''}`} />
                  </button>
                  <button
                    onClick={() => setEditingRule(rule)}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => duplicateRule(rule)}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteRule(rule.id)}
                    className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {rules.length === 0 && (
          <div className="text-center py-12">
            <Zap className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              No automation rules configured yet
            </p>
            <button
              onClick={() => setIsCreating(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Your First Rule
            </button>
          </div>
        )}
      </div>

      {/* Rule Editor Modal */}
      {editingRule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {isCreating ? 'Create Automation Rule' : 'Edit Automation Rule'}
              </h3>
              <button
                onClick={() => {
                  setEditingRule(null);
                  setIsCreating(false);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Basic Info */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Rule Name
                </label>
                <input
                  type="text"
                  value={editingRule.name}
                  onChange={e => setEditingRule({ ...editingRule, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter rule name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={editingRule.description}
                  onChange={e => setEditingRule({ ...editingRule, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Describe what this rule does"
                />
              </div>

              {/* Trigger */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Trigger
                </label>
                <select
                  value={editingRule.trigger.type}
                  onChange={e =>
                    setEditingRule({
                      ...editingRule,
                      trigger: { type: e.target.value as any, config: {} },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="manual">Manual</option>
                  <option value="task_created">Task Created</option>
                  <option value="task_updated">Task Updated</option>
                  <option value="status_changed">Status Changed</option>
                  <option value="field_changed">Field Changed</option>
                  <option value="time_based">Time Based</option>
                  <option value="webhook">Webhook</option>
                </select>
              </div>

              {/* Conditions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Conditions
                </label>
                <div className="space-y-2">
                  {editingRule.conditions.map((condition, index) => (
                    <div
                      key={condition.id}
                      className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                    >
                      <Filter className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {condition.description}
                      </span>
                      <button
                        onClick={() =>
                          setEditingRule({
                            ...editingRule,
                            conditions: editingRule.conditions.filter(c => c.id !== condition.id),
                          })
                        }
                        className="ml-auto p-1 text-red-600 hover:text-red-700"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const newCondition: AutomationCondition = {
                        id: `cond-${Date.now()}`,
                        type: 'field',
                        operator: 'equals',
                        description: 'New condition',
                      };
                      setEditingRule({
                        ...editingRule,
                        conditions: [...editingRule.conditions, newCondition],
                      });
                    }}
                    className="w-full p-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500"
                  >
                    + Add Condition
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Actions
                </label>
                <div className="space-y-2">
                  {editingRule.actions.map(action => (
                    <div
                      key={action.id}
                      className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                    >
                      {getActionIcon(action.type)}
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {action.description}
                      </span>
                      <button
                        onClick={() =>
                          setEditingRule({
                            ...editingRule,
                            actions: editingRule.actions.filter(a => a.id !== action.id),
                          })
                        }
                        className="ml-auto p-1 text-red-600 hover:text-red-700"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const newAction: AutomationAction = {
                        id: `act-${Date.now()}`,
                        type: 'update_field',
                        config: {},
                        description: 'New action',
                      };
                      setEditingRule({
                        ...editingRule,
                        actions: [...editingRule.actions, newAction],
                      });
                    }}
                    className="w-full p-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500"
                  >
                    + Add Action
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => updateRule(editingRule)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save Rule
                </button>
                <button
                  onClick={() => {
                    setEditingRule(null);
                    setIsCreating(false);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
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

export default WorkflowAutomation;
