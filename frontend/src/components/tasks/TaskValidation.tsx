import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  AlertCircle,
  XCircle,
  Info,
  Shield,
  Clock,
  Target,
  FileText,
  Users,
  Calendar,
  Flag,
  Eye,
  EyeOff,
  Settings,
  Play,
  Pause,
  RotateCcw,
  TrendingUp,
  BarChart3,
  Zap,
  Award,
  AlertTriangle,
  CheckSquare,
  XSquare,
} from 'lucide-react';

interface ValidationRule {
  id: string;
  name: string;
  description: string;
  type: 'required' | 'warning' | 'info' | 'error';
  category: 'content' | 'structure' | 'quality' | 'compliance' | 'custom';
  isActive: boolean;
  isCustom: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  condition: ValidationCondition;
  action?: ValidationAction;
  createdAt: string;
  createdBy: string;
}

interface ValidationCondition {
  field: string;
  operator:
    | 'exists'
    | 'not_exists'
    | 'equals'
    | 'not_equals'
    | 'contains'
    | 'not_contains'
    | 'greater_than'
    | 'less_than'
    | 'regex'
    | 'custom';
  value?: any;
  customFunction?: string;
}

interface ValidationAction {
  type: 'prevent_save' | 'show_warning' | 'auto_fix' | 'notify_user' | 'require_approval';
  message?: string;
  fixValue?: any;
}

interface ValidationResult {
  ruleId: string;
  ruleName: string;
  status: 'pass' | 'fail' | 'warning' | 'info';
  message: string;
  fieldValue?: any;
  expectedValue?: any;
  canAutoFix: boolean;
  autoFixAction?: () => void;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface QualityMetrics {
  completeness: number;
  clarity: number;
  feasibility: number;
  priorityAlignment: number;
  overallScore: number;
  issues: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

interface TaskValidationProps {
  taskData: any;
  onValidationComplete?: (results: ValidationResult[]) => void;
  onQualityMetricsChange?: (metrics: QualityMetrics) => void;
  enableAutoFix?: boolean;
  showQualityScore?: boolean;
  className?: string;
}

const TaskValidation: React.FC<TaskValidationProps> = ({
  taskData,
  onValidationComplete,
  onQualityMetricsChange,
  enableAutoFix = true,
  showQualityScore = true,
  className = '',
}) => {
  const [validationRules, setValidationRules] = useState<ValidationRule[]>([]);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [qualityMetrics, setQualityMetrics] = useState<QualityMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isValidating, setIsValidating] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [expandedResults, setExpandedResults] = useState<Set<string>>(new Set());

  // Mock validation rules
  useEffect(() => {
    const mockRules: ValidationRule[] = [
      // Required field validations
      {
        id: 'title-required',
        name: 'Task Title Required',
        description: 'Every task must have a descriptive title',
        type: 'required',
        category: 'content',
        isActive: true,
        isCustom: false,
        severity: 'critical',
        condition: {
          field: 'title',
          operator: 'exists',
        },
        action: {
          type: 'prevent_save',
          message: 'Task title is required',
        },
        createdAt: '2024-01-01T00:00:00Z',
        createdBy: 'system',
      },
      {
        id: 'title-length',
        name: 'Title Length Check',
        description: 'Title should be between 10 and 100 characters',
        type: 'warning',
        category: 'content',
        isActive: true,
        isCustom: false,
        severity: 'medium',
        condition: {
          field: 'title',
          operator: 'greater_than',
          value: 9,
        },
        action: {
          type: 'show_warning',
          message: 'Title should be at least 10 characters for better clarity',
        },
        createdAt: '2024-01-01T00:00:00Z',
        createdBy: 'system',
      },
      {
        id: 'description-required',
        name: 'Description Required',
        description: 'Tasks should have a detailed description',
        type: 'required',
        category: 'content',
        isActive: true,
        isCustom: false,
        severity: 'high',
        condition: {
          field: 'description',
          operator: 'exists',
        },
        action: {
          type: 'prevent_save',
          message: 'Task description is required',
        },
        createdAt: '2024-01-01T00:00:00Z',
        createdBy: 'system',
      },
      {
        id: 'description-quality',
        name: 'Description Quality',
        description: 'Description should provide sufficient detail',
        type: 'warning',
        category: 'quality',
        isActive: true,
        isCustom: false,
        severity: 'medium',
        condition: {
          field: 'description',
          operator: 'greater_than',
          value: 50,
        },
        action: {
          type: 'show_warning',
          message: 'Consider adding more details to the description',
        },
        createdAt: '2024-01-01T00:00:00Z',
        createdBy: 'system',
      },

      // Structure validations
      {
        id: 'assignee-required',
        name: 'Assignee Required',
        description: 'Tasks should be assigned to someone',
        type: 'warning',
        category: 'structure',
        isActive: true,
        isCustom: false,
        severity: 'medium',
        condition: {
          field: 'assigneeId',
          operator: 'exists',
        },
        action: {
          type: 'show_warning',
          message: 'Consider assigning this task to a team member',
        },
        createdAt: '2024-01-01T00:00:00Z',
        createdBy: 'system',
      },
      {
        id: 'priority-set',
        name: 'Priority Level',
        description: 'Tasks should have a priority level',
        type: 'warning',
        category: 'structure',
        isActive: true,
        isCustom: false,
        severity: 'medium',
        condition: {
          field: 'priority',
          operator: 'exists',
        },
        action: {
          type: 'show_warning',
          message: 'Set a priority level to help with task management',
        },
        createdAt: '2024-01-01T00:00:00Z',
        createdBy: 'system',
      },
      {
        id: 'due-date-reasonable',
        name: 'Reasonable Due Date',
        description: 'Due date should be realistic',
        type: 'warning',
        category: 'quality',
        isActive: true,
        isCustom: false,
        severity: 'medium',
        condition: {
          field: 'dueDate',
          operator: 'greater_than',
          value: new Date().toISOString(),
        },
        action: {
          type: 'show_warning',
          message: 'Due date should be in the future',
        },
        createdAt: '2024-01-01T00:00:00Z',
        createdBy: 'system',
      },

      // Quality validations
      {
        id: 'acceptance-criteria',
        name: 'Acceptance Criteria',
        description: 'Tasks should have clear acceptance criteria',
        type: 'info',
        category: 'quality',
        isActive: true,
        isCustom: false,
        severity: 'low',
        condition: {
          field: 'acceptanceCriteria',
          operator: 'exists',
        },
        action: {
          type: 'show_warning',
          message: 'Add acceptance criteria to define when the task is complete',
        },
        createdAt: '2024-01-01T00:00:00Z',
        createdBy: 'system',
      },
      {
        id: 'story-points',
        name: 'Story Points',
        description: 'Tasks should have estimated story points',
        type: 'info',
        category: 'quality',
        isActive: true,
        isCustom: false,
        severity: 'low',
        condition: {
          field: 'storyPoints',
          operator: 'exists',
        },
        action: {
          type: 'show_warning',
          message: 'Add story points for better sprint planning',
        },
        createdAt: '2024-01-01T00:00:00Z',
        createdBy: 'system',
      },

      // Compliance validations
      {
        id: 'security-clearance',
        name: 'Security Classification',
        description: 'High-security tasks must be properly classified',
        type: 'required',
        category: 'compliance',
        isActive: true,
        isCustom: false,
        severity: 'critical',
        condition: {
          field: 'securityLevel',
          operator: 'exists',
        },
        action: {
          type: 'prevent_save',
          message: 'Security classification is required for this type of task',
        },
        createdAt: '2024-01-01T00:00:00Z',
        createdBy: 'system',
      },

      // Custom validations
      {
        id: 'custom-labels',
        name: 'Required Labels',
        description: 'Tasks must have appropriate labels',
        type: 'warning',
        category: 'custom',
        isActive: true,
        isCustom: true,
        severity: 'medium',
        condition: {
          field: 'labels',
          operator: 'contains',
          value: ['development', 'bug'],
        },
        action: {
          type: 'show_warning',
          message: 'Consider adding relevant labels for better organization',
        },
        createdAt: '2024-01-01T00:00:00Z',
        createdBy: 'admin',
      },
    ];

    setValidationRules(mockRules);
    setIsLoading(false);
  }, []);

  // Run validation when task data changes
  useEffect(() => {
    if (taskData && !isLoading) {
      runValidation();
    }
  }, [taskData, validationRules, isLoading]);

  const runValidation = async () => {
    setIsValidating(true);
    const results: ValidationResult[] = [];

    for (const rule of validationRules.filter(r => r.isActive)) {
      const result = await validateRule(rule, taskData);
      if (result) {
        results.push(result);
      }
    }

    setValidationResults(results);
    calculateQualityMetrics(results);
    onValidationComplete?.(results);
    setIsValidating(false);
  };

  const validateRule = async (
    rule: ValidationRule,
    task: any
  ): Promise<ValidationResult | null> => {
    try {
      const fieldValue = getNestedValue(task, rule.condition.field);
      let isValid = false;

      switch (rule.condition.operator) {
        case 'exists':
          isValid = fieldValue !== undefined && fieldValue !== null && fieldValue !== '';
          break;
        case 'not_exists':
          isValid = fieldValue === undefined || fieldValue === null || fieldValue === '';
          break;
        case 'equals':
          isValid = fieldValue === rule.condition.value;
          break;
        case 'not_equals':
          isValid = fieldValue !== rule.condition.value;
          break;
        case 'contains':
          if (Array.isArray(fieldValue)) {
            isValid = fieldValue.includes(rule.condition.value);
          } else if (typeof fieldValue === 'string') {
            isValid = fieldValue.toLowerCase().includes(rule.condition.value.toLowerCase());
          }
          break;
        case 'not_contains':
          if (Array.isArray(fieldValue)) {
            isValid = !fieldValue.includes(rule.condition.value);
          } else if (typeof fieldValue === 'string') {
            isValid = !fieldValue.toLowerCase().includes(rule.condition.value.toLowerCase());
          }
          break;
        case 'greater_than':
          isValid = Number(fieldValue) > Number(rule.condition.value);
          break;
        case 'less_than':
          isValid = Number(fieldValue) < Number(rule.condition.value);
          break;
        case 'regex':
          if (typeof fieldValue === 'string') {
            const regex = new RegExp(rule.condition.value);
            isValid = regex.test(fieldValue);
          }
          break;
        default:
          isValid = false;
      }

      const status = isValid ? 'pass' : rule.type === 'required' ? 'fail' : rule.type;

      return {
        ruleId: rule.id,
        ruleName: rule.name,
        status,
        message: rule.action?.message || (isValid ? 'Requirement met' : 'Requirement not met'),
        fieldValue,
        expectedValue: rule.condition.value,
        canAutoFix: enableAutoFix && rule.action?.type === 'auto_fix',
        autoFixAction: () => applyAutoFix(rule, task),
        severity: rule.severity,
      };
    } catch (error) {
      console.error('Validation error:', error);
      return null;
    }
  };

  const getNestedValue = (obj: any, path: string): any => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  const applyAutoFix = (rule: ValidationRule, task: any) => {
    if (rule.action?.fixValue !== undefined) {
      // In real implementation, this would update the task data
      console.log(`Auto-fixing ${rule.condition.field} to:`, rule.action.fixValue);
      runValidation();
    }
  };

  const calculateQualityMetrics = (results: ValidationResult[]) => {
    const issues = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
    };

    const totalRules = validationRules.length;
    const passedRules = results.filter(r => r.status === 'pass').length;
    const failedRules = results.filter(r => r.status === 'fail').length;
    const warningRules = results.filter(r => r.status === 'warning').length;

    results.forEach(result => {
      if (result.status === 'fail' || result.status === 'warning') {
        issues[result.severity]++;
      }
    });

    const completeness = totalRules > 0 ? (passedRules / totalRules) * 100 : 0;
    const clarity = Math.max(0, 100 - warningRules * 10);
    const feasibility = Math.max(0, 100 - issues.high * 15 - issues.critical * 25);
    const priorityAlignment = Math.max(0, 100 - issues.medium * 5);

    const overallScore = (completeness + clarity + feasibility + priorityAlignment) / 4;

    const metrics: QualityMetrics = {
      completeness: Math.round(completeness),
      clarity: Math.round(clarity),
      feasibility: Math.round(feasibility),
      priorityAlignment: Math.round(priorityAlignment),
      overallScore: Math.round(overallScore),
      issues,
    };

    setQualityMetrics(metrics);
    onQualityMetricsChange?.(metrics);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'fail':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'info':
        return <Info className="w-4 h-4 text-blue-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800';
      case 'high':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800';
      case 'medium':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800';
      case 'low':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600';
    }
  };

  const getQualityScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 dark:text-green-400';
    if (score >= 75) return 'text-blue-600 dark:text-blue-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    if (score >= 40) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getQualityScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'Good';
    if (score >= 60) return 'Fair';
    if (score >= 40) return 'Poor';
    return 'Critical';
  };

  const toggleResultExpansion = (resultId: string) => {
    const newExpanded = new Set(expandedResults);
    if (newExpanded.has(resultId)) {
      newExpanded.delete(resultId);
    } else {
      newExpanded.add(resultId);
    }
    setExpandedResults(newExpanded);
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
        <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
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
              Task Validation & Quality
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Automated validation and quality checks for task completeness
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={runValidation}
              disabled={isValidating}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <RotateCw className={`w-4 h-4 mr-2 ${isValidating ? 'animate-spin' : ''}`} />
              {isValidating ? 'Validating...' : 'Re-validate'}
            </button>
            <button
              onClick={() => setShowRules(!showRules)}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Quality Score */}
      {showQualityScore && qualityMetrics && (
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Quality Score</h3>
            <div className="flex items-center space-x-2">
              <span
                className={`text-2xl font-bold ${getQualityScoreColor(qualityMetrics.overallScore)}`}
              >
                {qualityMetrics.overallScore}%
              </span>
              <span
                className={`px-2 py-1 text-sm font-medium rounded ${getSeverityColor(qualityMetrics.overallScore >= 75 ? 'low' : qualityMetrics.overallScore >= 50 ? 'medium' : 'high')}`}
              >
                {getQualityScoreLabel(qualityMetrics.overallScore)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {qualityMetrics.completeness}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Completeness</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {qualityMetrics.clarity}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Clarity</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {qualityMetrics.feasibility}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Feasibility</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {qualityMetrics.priorityAlignment}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Priority Alignment</div>
            </div>
          </div>

          {/* Issues Summary */}
          <div className="mt-6 flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <XCircle className="w-4 h-4 text-red-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {qualityMetrics.issues.critical} Critical
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {qualityMetrics.issues.high} High
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-yellow-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {qualityMetrics.issues.medium} Medium
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Info className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {qualityMetrics.issues.low} Low
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Validation Rules Configuration */}
      {showRules && (
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Validation Rules
          </h3>
          <div className="space-y-3">
            {validationRules.map(rule => (
              <div
                key={rule.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={rule.isActive}
                    onChange={e => {
                      setValidationRules(
                        rules.map(r =>
                          r.id === rule.id ? { ...r, isActive: e.target.checked } : r
                        )
                      );
                    }}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">{rule.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{rule.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded ${getSeverityColor(rule.severity)}`}
                  >
                    {rule.severity}
                  </span>
                  <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                    {rule.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Validation Results */}
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Validation Results
        </h3>

        {validationResults.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">All validation checks passed!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {validationResults.map(result => (
              <div
                key={result.ruleId}
                className={`border rounded-lg p-4 ${getSeverityColor(result.severity)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    {getStatusIcon(result.status)}
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {result.ruleName}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {result.message}
                      </p>

                      {expandedResults.has(result.ruleId) && (
                        <div className="mt-3 space-y-2 text-sm">
                          {result.fieldValue !== undefined && (
                            <div>
                              <span className="font-medium">Current value:</span>{' '}
                              {String(result.fieldValue)}
                            </div>
                          )}
                          {result.expectedValue !== undefined && (
                            <div>
                              <span className="font-medium">Expected:</span>{' '}
                              {String(result.expectedValue)}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {result.canAutoFix && (
                      <button
                        onClick={result.autoFixAction}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                      >
                        Auto Fix
                      </button>
                    )}
                    <button
                      onClick={() => toggleResultExpansion(result.ruleId)}
                      className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {expandedResults.has(result.ruleId) ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskValidation;
