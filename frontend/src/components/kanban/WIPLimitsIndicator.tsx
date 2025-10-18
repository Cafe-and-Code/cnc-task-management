import React, { useState } from 'react';
import { AlertTriangle, Shield, Settings, X, Check } from 'lucide-react';

interface WIPLimitsIndicatorProps {
  columnId: string;
  columnTitle: string;
  currentCount: number;
  limit: number;
  onLimitChange?: (newLimit: number) => void;
  showControls?: boolean;
  compact?: boolean;
}

export const WIPLimitsIndicator: React.FC<WIPLimitsIndicatorProps> = ({
  columnId,
  columnTitle,
  currentCount,
  limit,
  onLimitChange,
  showControls = false,
  compact = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempLimit, setTempLimit] = useState(limit.toString());
  const [showWarning, setShowWarning] = useState(false);

  const percentage = (currentCount / limit) * 100;
  const isOverLimit = currentCount > limit;
  const isNearLimit = percentage >= 80 && percentage < 100;
  const isAtLimit = percentage >= 100;

  const getStatusColor = () => {
    if (isOverLimit)
      return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700';
    if (isAtLimit)
      return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700';
    if (isNearLimit)
      return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700';
    return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700';
  };

  const getProgressColor = () => {
    if (isOverLimit) return 'bg-red-500';
    if (isAtLimit) return 'bg-orange-500';
    if (isNearLimit) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusIcon = () => {
    if (isOverLimit) return <AlertTriangle className="w-4 h-4" />;
    if (isAtLimit || isNearLimit) return <Shield className="w-4 h-4" />;
    return <Check className="w-4 h-4" />;
  };

  const handleSaveLimit = () => {
    const newLimit = parseInt(tempLimit);
    if (newLimit > 0 && newLimit !== limit) {
      onLimitChange?.(newLimit);
    } else {
      setTempLimit(limit.toString());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setTempLimit(limit.toString());
    setIsEditing(false);
  };

  if (compact) {
    return (
      <div
        className={`flex items-center space-x-2 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor()}`}
      >
        {getStatusIcon()}
        <span>
          {currentCount}/{limit}
        </span>
        {isOverLimit && <span className="text-xs">+{currentCount - limit}</span>}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Progress Bar */}
      <div className="relative">
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
        {isOverLimit && (
          <div
            className="absolute top-0 h-2 bg-red-500 rounded-full opacity-60"
            style={{
              left: `${100}%`,
              width: `${((currentCount - limit) / limit) * 100}%`,
            }}
          />
        )}
      </div>

      {/* Status Indicator */}
      <div
        className={`flex items-center justify-between p-2 rounded-lg border ${getStatusColor()}`}
      >
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <div>
            <p className="text-sm font-medium">{columnTitle}</p>
            <p className="text-xs opacity-75">
              {currentCount} of {limit} tasks
              {isOverLimit && (
                <span className="font-semibold"> ({currentCount - limit} over limit)</span>
              )}
            </p>
          </div>
        </div>

        {showControls && (
          <div className="flex items-center space-x-2">
            {isEditing ? (
              <div className="flex items-center space-x-1">
                <input
                  type="number"
                  value={tempLimit}
                  onChange={e => setTempLimit(e.target.value)}
                  className="w-16 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  min="1"
                  max="50"
                />
                <button
                  onClick={handleSaveLimit}
                  className="p-1 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="p-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <Settings className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Warning Message */}
      {isOverLimit && (
        <div className="flex items-start space-x-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
          <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800 dark:text-red-200">WIP Limit Exceeded</p>
            <p className="text-xs text-red-600 dark:text-red-400">
              The {columnTitle} column has exceeded its WIP limit of {limit} tasks. Consider moving
              some tasks to reduce bottlenecks.
            </p>
          </div>
        </div>
      )}

      {/* Near Limit Warning */}
      {isNearLimit && !isAtLimit && (
        <div className="flex items-start space-x-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
          <Shield className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              Approaching WIP Limit
            </p>
            <p className="text-xs text-yellow-600 dark:text-yellow-400">
              The {columnTitle} column is approaching its WIP limit.
              {Math.ceil(limit - currentCount)} more task{limit - currentCount !== 1 ? 's' : ''} can
              be added.
            </p>
          </div>
        </div>
      )}

      {/* Recommendations */}
      {isOverLimit && (
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
          <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
            Recommendations:
          </p>
          <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
            <li>• Complete current tasks before adding new ones</li>
            <li>• Consider increasing the WIP limit if this is normal workflow</li>
            <li>• Look for blockers preventing task completion</li>
            <li>• Re-allocate resources to clear bottlenecks</li>
          </ul>
        </div>
      )}
    </div>
  );
};
