import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  ZoomIn,
  ZoomOut,
  MousePointer,
  Keyboard,
  Contrast,
} from 'lucide-react';

interface AccessibilityOverlayProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onToggleHighContrast: () => void;
  onToggleScreenReader: () => void;
  onToggleReducedMotion: () => void;
  onToggleLargeText: () => void;
  onToggleFocusVisible: () => void;
  className?: string;
}

export const AccessibilityOverlay: React.FC<AccessibilityOverlayProps> = ({
  onZoomIn,
  onZoomOut,
  onToggleHighContrast,
  onToggleScreenReader,
  onToggleReducedMotion,
  onToggleLargeText,
  onToggleFocusVisible,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState({
    screenReaderEnabled: false,
    highContrast: false,
    reducedMotion: false,
    largeText: false,
    focusVisible: true,
    zoom: 100,
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const adjustZoom = (delta: number) => {
    const newZoom = Math.max(50, Math.min(200, settings.zoom + delta));
    setSettings(prev => ({ ...prev, zoom: newZoom }));

    // Apply zoom to the page
    document.body.style.zoom = `${newZoom}%`;

    if (delta > 0) {
      onZoomIn();
    } else {
      onZoomOut();
    }
  };

  // Announce changes to screen readers
  const announceChange = (message: string) => {
    if (settings.screenReaderEnabled) {
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'polite');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.className = 'sr-only';
      announcement.textContent = message;
      document.body.appendChild(announcement);
      setTimeout(() => document.body.removeChild(announcement), 1000);
    }
  };

  // Apply accessibility settings to the document
  useEffect(() => {
    const root = document.documentElement;

    // High contrast mode
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Reduced motion
    if (settings.reducedMotion) {
      root.style.setProperty('--transition-duration', '0ms');
      root.classList.add('reduce-motion');
    } else {
      root.style.removeProperty('--transition-duration');
      root.classList.remove('reduce-motion');
    }

    // Large text
    if (settings.largeText) {
      root.classList.add('large-text');
    } else {
      root.classList.remove('large-text');
    }

    // Focus visible
    if (settings.focusVisible) {
      root.classList.add('focus-visible');
    } else {
      root.classList.remove('focus-visible');
    }

    // Screen reader announcements
    if (settings.screenReaderEnabled) {
      root.setAttribute('aria-live', 'polite');
    } else {
      root.removeAttribute('aria-live');
    }
  }, [settings]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Alt + A: Toggle accessibility menu
      if (event.altKey && event.key === 'a') {
        event.preventDefault();
        setIsOpen(!isOpen);
        announceChange(isOpen ? 'Accessibility menu closed' : 'Accessibility menu opened');
      }

      // Alt + Z: Zoom in
      if (event.altKey && event.key === 'z') {
        event.preventDefault();
        adjustZoom(10);
        announceChange(`Zoom increased to ${settings.zoom + 10}%`);
      }

      // Alt + X: Zoom out
      if (event.altKey && event.key === 'x') {
        event.preventDefault();
        adjustZoom(-10);
        announceChange(`Zoom decreased to ${settings.zoom - 10}%`);
      }

      // Alt + 0: Reset zoom
      if (event.altKey && event.key === '0') {
        event.preventDefault();
        document.body.style.zoom = '100%';
        setSettings(prev => ({ ...prev, zoom: 100 }));
        announceChange('Zoom reset to 100%');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, settings.zoom]);

  return (
    <>
      {/* Accessibility Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-4 right-4 p-3 rounded-full shadow-lg transition-colors z-40 ${
          isOpen
            ? 'bg-blue-600 text-white'
            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
        }`}
        aria-label="Accessibility options (Alt+A)"
        title="Accessibility options (Alt+A)"
      >
        <Keyboard className="w-5 h-5" />
      </button>

      {/* Accessibility Panel */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Accessibility Options
              </h2>
              <button
                onClick={() => {
                  setIsOpen(false);
                  announceChange('Accessibility menu closed');
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                aria-label="Close accessibility menu"
              >
                ×
              </button>
            </div>

            {/* Content */}
            <div
              className="p-6 space-y-6 overflow-y-auto"
              style={{ maxHeight: 'calc(90vh - 140px)' }}
            >
              {/* Screen Reader */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {settings.screenReaderEnabled ? (
                    <Volume2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  ) : (
                    <VolumeX className="w-5 h-5 text-gray-400" />
                  )}
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Screen Reader</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Enable screen reader optimizations
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    toggleSetting('screenReaderEnabled');
                    announceChange(
                      settings.screenReaderEnabled
                        ? 'Screen reader disabled'
                        : 'Screen reader enabled'
                    );
                  }}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.screenReaderEnabled ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                  role="switch"
                  aria-checked={settings.screenReaderEnabled}
                  aria-label="Toggle screen reader"
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.screenReaderEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* High Contrast */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Contrast className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">High Contrast</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Increase color contrast for better visibility
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    toggleSetting('highContrast');
                    onToggleHighContrast();
                    announceChange(
                      settings.highContrast ? 'High contrast disabled' : 'High contrast enabled'
                    );
                  }}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.highContrast ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                  role="switch"
                  aria-checked={settings.highContrast}
                  aria-label="Toggle high contrast"
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.highContrast ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Reduced Motion */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <MousePointer className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Reduced Motion</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Minimize animations and transitions
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    toggleSetting('reducedMotion');
                    onToggleReducedMotion();
                    announceChange(
                      settings.reducedMotion ? 'Reduced motion disabled' : 'Reduced motion enabled'
                    );
                  }}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.reducedMotion ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                  role="switch"
                  aria-checked={settings.reducedMotion}
                  aria-label="Toggle reduced motion"
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.reducedMotion ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Large Text */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Eye className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Large Text</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Increase text size for better readability
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    toggleSetting('largeText');
                    onToggleLargeText();
                    announceChange(
                      settings.largeText ? 'Large text disabled' : 'Large text enabled'
                    );
                  }}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.largeText ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                  role="switch"
                  aria-checked={settings.largeText}
                  aria-label="Toggle large text"
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.largeText ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Focus Visible */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <EyeOff className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Focus Indicators</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Show visible focus indicators
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    toggleSetting('focusVisible');
                    onToggleFocusVisible();
                    announceChange(
                      settings.focusVisible
                        ? 'Focus indicators disabled'
                        : 'Focus indicators enabled'
                    );
                  }}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.focusVisible ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                  role="switch"
                  aria-checked={settings.focusVisible}
                  aria-label="Toggle focus indicators"
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.focusVisible ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Zoom Controls */}
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">Zoom Level</h3>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => adjustZoom(-10)}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                    aria-label="Zoom out (Alt+X)"
                  >
                    <ZoomOut className="w-5 h-5" />
                  </button>
                  <div className="flex-1 text-center">
                    <span className="text-lg font-medium text-gray-900 dark:text-white">
                      {settings.zoom}%
                    </span>
                  </div>
                  <button
                    onClick={() => adjustZoom(10)}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                    aria-label="Zoom in (Alt+Z)"
                  >
                    <ZoomIn className="w-5 h-5" />
                  </button>
                </div>
                <div className="mt-2 flex items-center space-x-2">
                  <input
                    type="range"
                    min="50"
                    max="200"
                    step="10"
                    value={settings.zoom}
                    onChange={e => {
                      const zoom = parseInt(e.target.value);
                      setSettings(prev => ({ ...prev, zoom }));
                      document.body.style.zoom = `${zoom}%`;
                      announceChange(`Zoom set to ${zoom}%`);
                    }}
                    className="flex-1"
                    aria-label="Zoom level"
                  />
                </div>
              </div>

              {/* Keyboard Shortcuts */}
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                  Keyboard Shortcuts
                </h3>
                <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <div>• Alt+A: Toggle accessibility menu</div>
                  <div>• Alt+Z: Zoom in</div>
                  <div>• Alt+X: Zoom out</div>
                  <div>• Alt+0: Reset zoom to 100%</div>
                  <div>• Tab: Navigate through elements</div>
                  <div>• Enter/Space: Activate buttons</div>
                  <div>• Escape: Close modals</div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  // Reset all settings
                  setSettings({
                    screenReaderEnabled: false,
                    highContrast: false,
                    reducedMotion: false,
                    largeText: false,
                    focusVisible: true,
                    zoom: 100,
                  });
                  document.body.style.zoom = '100%';
                  document.documentElement.classList.remove(
                    'high-contrast',
                    'reduce-motion',
                    'large-text',
                    'focus-visible'
                  );
                  announceChange('All accessibility settings reset');
                }}
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Reset All
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  announceChange('Accessibility menu closed');
                }}
                className="ml-3 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Hook for managing accessibility settings
export const useAccessibility = () => {
  const [settings, setSettings] = useState(() => {
    // Load settings from localStorage
    const saved = localStorage.getItem('accessibility-settings');
    return saved
      ? JSON.parse(saved)
      : {
          screenReaderEnabled: false,
          highContrast: false,
          reducedMotion: false,
          largeText: false,
          focusVisible: true,
          zoom: 100,
        };
  });

  const updateSetting = (key: keyof typeof settings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('accessibility-settings', JSON.stringify(newSettings));
  };

  return {
    settings,
    updateSetting,
    resetSettings: () => {
      const defaultSettings = {
        screenReaderEnabled: false,
        highContrast: false,
        reducedMotion: false,
        largeText: false,
        focusVisible: true,
        zoom: 100,
      };
      setSettings(defaultSettings);
      localStorage.setItem('accessibility-settings', JSON.stringify(defaultSettings));
    },
  };
};
