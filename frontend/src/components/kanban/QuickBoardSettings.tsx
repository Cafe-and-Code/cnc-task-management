import React, { useState } from 'react';
import {
  Settings,
  Grid3x3,
  List,
  Eye,
  EyeOff,
  Users,
  Filter,
  Palette,
  ChevronDown,
  X,
  Check,
  RotateCcw,
  Save,
} from 'lucide-react';

interface QuickBoardSettingsProps {
  viewMode: 'board' | 'list';
  onViewModeChange: (mode: 'board' | 'list') => void;
  compactMode: boolean;
  onCompactModeChange: (enabled: boolean) => void;
  showAvatars: boolean;
  onShowAvatarsChange: (enabled: boolean) => void;
  showStats: boolean;
  onShowStatsChange: (enabled: boolean) => void;
  swimlanesEnabled: boolean;
  onSwimlanesToggle: (enabled: boolean) => void;
  filtersActive: number;
  onOpenAdvancedSettings: () => void;
  onResetView: () => void;
  className?: string;
}

export const QuickBoardSettings: React.FC<QuickBoardSettingsProps> = ({
  viewMode,
  onViewModeChange,
  compactMode,
  onCompactModeChange,
  showAvatars,
  onShowAvatarsChange,
  showStats,
  onShowStatsChange,
  swimlanesEnabled,
  onSwimlanesToggle,
  filtersActive,
  onOpenAdvancedSettings,
  onResetView,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const settings = [
    {
      id: 'viewMode',
      label: 'View Mode',
      icon: viewMode === 'board' ? Grid3x3 : List,
      value: viewMode,
      options: [
        { value: 'board', label: 'Board', icon: Grid3x3 },
        { value: 'list', label: 'List', icon: List },
      ],
      onChange: (value: string) => onViewModeChange(value as 'board' | 'list'),
    },
    {
      id: 'compactMode',
      label: 'Compact Mode',
      icon: compactMode ? Eye : EyeOff,
      value: compactMode,
      toggle: true,
      onChange: (value: boolean) => onCompactModeChange(value),
    },
    {
      id: 'showAvatars',
      label: 'Show Avatars',
      icon: showAvatars ? Users : EyeOff,
      value: showAvatars,
      toggle: true,
      onChange: (value: boolean) => onShowAvatarsChange(value),
    },
    {
      id: 'showStats',
      label: 'Show Statistics',
      icon: showStats ? Eye : EyeOff,
      value: showStats,
      toggle: true,
      onChange: (value: boolean) => onShowStatsChange(value),
    },
    {
      id: 'swimlanes',
      label: 'Swimlanes',
      icon: swimlanesEnabled ? Users : EyeOff,
      value: swimlanesEnabled,
      toggle: true,
      onChange: (value: boolean) => onSwimlanesToggle(value),
    },
  ];

  const handleSettingChange = (settingId: string, value: any) => {
    const setting = settings.find(s => s.id === settingId);
    if (setting) {
      setting.onChange(value);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Settings Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-lg transition-colors ${
          isOpen
            ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
        title="Board settings"
      >
        <Settings className="w-4 h-4" />
      </button>

      {/* Settings Dropdown */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-medium text-gray-900 dark:text-white">Quick Settings</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Settings List */}
          <div className="p-4 space-y-4">
            {settings.map(setting => {
              const Icon = setting.icon;

              if (setting.toggle) {
                return (
                  <div key={setting.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Icon className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {setting.label}
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={setting.value}
                        onChange={e => handleSettingChange(setting.id, e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                );
              }

              if (setting.options) {
                return (
                  <div key={setting.id}>
                    <div className="flex items-center space-x-3 mb-2">
                      <Icon className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {setting.label}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 ml-7">
                      {setting.options.map(option => {
                        const OptionIcon = option.icon;
                        return (
                          <button
                            key={option.value}
                            onClick={() => handleSettingChange(setting.id, option.value)}
                            className={`flex items-center space-x-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                              setting.value === option.value
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                          >
                            <OptionIcon className="w-4 h-4" />
                            <span>{option.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              }

              return null;
            })}

            {/* Filters Status */}
            {filtersActive > 0 && (
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm text-blue-700 dark:text-blue-300">
                    {filtersActive} active filter{filtersActive !== 1 ? 's' : ''}
                  </span>
                </div>
                <button
                  onClick={() => {
                    // In a real implementation, this would clear all filters
                    console.log('Clear all filters');
                  }}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => {
                onResetView();
                setIsOpen(false);
              }}
              className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset View</span>
            </button>

            <button
              onClick={() => {
                onOpenAdvancedSettings();
                setIsOpen(false);
              }}
              className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
            >
              <Palette className="w-4 h-4" />
              <span>Advanced Settings</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Compact version for mobile or tight spaces
export const CompactBoardSettings: React.FC<QuickBoardSettingsProps> = props => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-lg transition-colors ${
          isOpen
            ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
      >
        <Settings className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-900 dark:text-white">Board Settings</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">Compact Mode</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={props.compactMode}
                    onChange={e => {
                      props.onCompactModeChange(e.target.checked);
                      setIsOpen(false);
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">Show Avatars</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={props.showAvatars}
                    onChange={e => {
                      props.onShowAvatarsChange(e.target.checked);
                      setIsOpen(false);
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">Swimlanes</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={props.swimlanesEnabled}
                    onChange={e => {
                      props.onSwimlanesToggle(e.target.checked);
                      setIsOpen(false);
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => {
                    props.onOpenAdvancedSettings();
                    setIsOpen(false);
                  }}
                  className="w-full px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                >
                  Advanced Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
