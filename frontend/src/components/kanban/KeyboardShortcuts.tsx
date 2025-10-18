import React, { useEffect, useState, useCallback } from 'react';
import {
  Keyboard,
  X,
  HelpCircle,
  Search,
  Plus,
  ArrowUpDown,
  Filter,
  Settings,
  Save,
  Eye,
  EyeOff,
} from 'lucide-react';

interface Shortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  description: string;
  action: () => void;
  category: 'navigation' | 'task' | 'view' | 'filter' | 'edit';
}

interface KeyboardShortcutsProps {
  onCreateTask: () => void;
  onToggleFilters: () => void;
  onToggleSettings: () => void;
  onSearchFocus: () => void;
  onSaveView: () => void;
  onToggleCompactMode: () => void;
  onToggleSwimlanes: () => void;
  onMoveTaskLeft: () => void;
  onMoveTaskRight: () => void;
  onMoveTaskUp: () => void;
  onMoveTaskDown: () => void;
  onSelectNextTask: () => void;
  onSelectPreviousTask: () => void;
  onOpenTaskDetails: () => void;
  onDeleteTask: () => void;
  onCopyTask: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onToggleHelp: () => void;
}

export const KeyboardShortcuts: React.FC<KeyboardShortcutsProps> = ({
  onCreateTask,
  onToggleFilters,
  onToggleSettings,
  onSearchFocus,
  onSaveView,
  onToggleCompactMode,
  onToggleSwimlanes,
  onMoveTaskLeft,
  onMoveTaskRight,
  onMoveTaskUp,
  onMoveTaskDown,
  onSelectNextTask,
  onSelectPreviousTask,
  onOpenTaskDetails,
  onDeleteTask,
  onCopyTask,
  onUndo,
  onRedo,
  onToggleHelp,
}) => {
  const [showHelp, setShowHelp] = useState(false);
  const [isModifierPressed, setIsModifierPressed] = useState(false);

  const shortcuts: Shortcut[] = [
    // Task actions
    {
      key: 'c',
      ctrl: true,
      description: 'Create new task',
      action: onCreateTask,
      category: 'task',
    },
    {
      key: 'Enter',
      description: 'Open task details',
      action: onOpenTaskDetails,
      category: 'task',
    },
    {
      key: 'Delete',
      description: 'Delete selected task',
      action: onDeleteTask,
      category: 'task',
    },
    {
      key: 'd',
      ctrl: true,
      description: 'Duplicate selected task',
      action: onCopyTask,
      category: 'task',
    },

    // Navigation
    {
      key: 'ArrowLeft',
      description: 'Move task to previous column',
      action: onMoveTaskLeft,
      category: 'navigation',
    },
    {
      key: 'ArrowRight',
      description: 'Move task to next column',
      action: onMoveTaskRight,
      category: 'navigation',
    },
    {
      key: 'ArrowUp',
      description: 'Select previous task',
      action: onSelectPreviousTask,
      category: 'navigation',
    },
    {
      key: 'ArrowDown',
      description: 'Select next task',
      action: onSelectNextTask,
      category: 'navigation',
    },
    {
      key: 'j',
      description: 'Select next task (vim style)',
      action: onSelectNextTask,
      category: 'navigation',
    },
    {
      key: 'k',
      description: 'Select previous task (vim style)',
      action: onSelectPreviousTask,
      category: 'navigation',
    },

    // View actions
    {
      key: '/',
      description: 'Focus search',
      action: onSearchFocus,
      category: 'view',
    },
    {
      key: 'f',
      ctrl: true,
      description: 'Toggle filters',
      action: onToggleFilters,
      category: 'view',
    },
    {
      key: 's',
      ctrl: true,
      description: 'Save current view',
      action: onSaveView,
      category: 'view',
    },
    {
      key: 'm',
      ctrl: true,
      description: 'Toggle compact mode',
      action: onToggleCompactMode,
      category: 'view',
    },
    {
      key: 'l',
      ctrl: true,
      description: 'Toggle swimlanes',
      action: onToggleSwimlanes,
      category: 'view',
    },

    // Settings and help
    {
      key: ',',
      ctrl: true,
      description: 'Open board settings',
      action: onToggleSettings,
      category: 'settings',
    },
    {
      key: '?',
      description: 'Show keyboard shortcuts',
      action: () => setShowHelp(true),
      category: 'settings',
    },
    {
      key: 'Escape',
      description: 'Close modals / cancel actions',
      action: () => setShowHelp(false),
      category: 'settings',
    },

    // Edit actions
    {
      key: 'z',
      ctrl: true,
      description: 'Undo',
      action: onUndo,
      category: 'edit',
    },
    {
      key: 'y',
      ctrl: true,
      description: 'Redo',
      action: onRedo,
      category: 'edit',
    },
  ];

  const formatShortcut = (shortcut: Shortcut): string => {
    const parts = [];
    if (shortcut.ctrl) parts.push('Ctrl');
    if (shortcut.shift) parts.push('Shift');
    if (shortcut.alt) parts.push('Alt');
    parts.push(shortcut.key.toUpperCase());
    return parts.join(' + ');
  };

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Check for modifier keys
      setIsModifierPressed(event.ctrlKey || event.metaKey || event.shiftKey || event.altKey);

      // Ignore shortcuts when typing in input fields
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.contentEditable === 'true'
      ) {
        // Allow some shortcuts even when typing
        if (event.key === 'Escape') {
          shortcuts.find(s => s.key === 'Escape')?.action();
        }
        return;
      }

      // Find matching shortcut
      const matchingShortcut = shortcuts.find(shortcut => {
        const keyMatches = shortcut.key.toLowerCase() === event.key.toLowerCase();
        const ctrlMatches = (shortcut.ctrl || false) === (event.ctrlKey || event.metaKey);
        const shiftMatches = (shortcut.shift || false) === event.shiftKey;
        const altMatches = (shortcut.alt || false) === event.altKey;

        return keyMatches && ctrlMatches && shiftMatches && altMatches;
      });

      if (matchingShortcut) {
        event.preventDefault();
        matchingShortcut.action();
      }
    },
    [shortcuts]
  );

  const handleKeyUp = useCallback(() => {
    setIsModifierPressed(false);
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  const shortcutsByCategory = shortcuts.reduce(
    (acc, shortcut) => {
      if (!acc[shortcut.category]) {
        acc[shortcut.category] = [];
      }
      acc[shortcut.category].push(shortcut);
      return acc;
    },
    {} as Record<string, Shortcut[]>
  );

  const categoryTitles = {
    navigation: 'Navigation',
    task: 'Task Actions',
    view: 'View Controls',
    settings: 'Settings & Help',
    edit: 'Edit Actions',
  };

  return (
    <>
      {/* Help Button */}
      <button
        onClick={() => setShowHelp(true)}
        className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        title="Keyboard shortcuts (?)"
      >
        <HelpCircle className="w-4 h-4" />
      </button>

      {/* Keyboard Shortcuts Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <Keyboard className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Keyboard Shortcuts
                </h2>
              </div>
              <button
                onClick={() => setShowHelp(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 140px)' }}>
              <div className="mb-6">
                <p className="text-gray-600 dark:text-gray-400">
                  Use these keyboard shortcuts to navigate and manage your Kanban board more
                  efficiently.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(shortcutsByCategory).map(([category, categoryShortcuts]) => (
                  <div key={category}>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                      {categoryTitles[category as keyof typeof categoryTitles]}
                    </h3>
                    <div className="space-y-2">
                      {categoryShortcuts.map(shortcut => (
                        <div
                          key={`${category}-${shortcut.key}`}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                        >
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {shortcut.description}
                          </span>
                          <kbd className="px-2 py-1 text-xs font-mono bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded">
                            {formatShortcut(shortcut)}
                          </kbd>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Tips */}
              <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">Tips</h4>
                <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                  <li>• Shortcuts are disabled when typing in input fields</li>
                  <li>• Use Escape to close modals and cancel actions</li>
                  <li>• Ctrl+Z works for undoing most actions</li>
                  <li>• Use arrow keys or J/K to navigate between tasks</li>
                  <li>• Press ? anytime to show this help dialog</li>
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowHelp(false)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modifier Indicator */}
      {isModifierPressed && (
        <div className="fixed bottom-4 left-4 bg-gray-800 text-white px-3 py-2 rounded-lg text-sm z-40">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            <span>Modifier key pressed</span>
          </div>
        </div>
      )}
    </>
  );
};

// Hook for providing keyboard shortcut context
export const useKeyboardShortcuts = () => {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isKeyboardNavigation, setIsKeyboardNavigation] = useState(false);

  const selectTask = useCallback((taskId: string) => {
    setSelectedTaskId(taskId);
    setIsKeyboardNavigation(true);

    // Scroll to task if needed
    const element = document.getElementById(`task-${taskId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedTaskId(null);
    setIsKeyboardNavigation(false);
  }, []);

  return {
    selectedTaskId,
    isKeyboardNavigation,
    selectTask,
    clearSelection,
  };
};

// HOC for adding keyboard shortcuts to components
export const withKeyboardShortcuts = <P extends object>(
  Component: React.ComponentType<P>,
  shortcuts: Partial<KeyboardShortcutsProps>
) => {
  return React.forwardRef<any, P>((props, ref) => {
    return <Component {...props} {...shortcuts} ref={ref} />;
  });
};
