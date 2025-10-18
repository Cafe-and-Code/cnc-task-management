import React, { useState, useEffect, useRef, ReactNode } from 'react';

// Feature detection utilities
export const FeatureDetection = {
  // Browser features
  supportsIntersectionObserver: () => 'IntersectionObserver' in window,
  supportsResizeObserver: () => 'ResizeObserver' in window,
  supportsMutationObserver: () => 'MutationObserver' in window,
  supportsWebWorkers: () => 'Worker' in window,
  supportsServiceWorker: () => 'serviceWorker' in navigator,
  supportsPushManager: () => 'PushManager' in window,
  supportsNotification: () => 'Notification' in window,
  supportsGeolocation: () => 'geolocation' in navigator,
  supportsCamera: () => 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices,
  supportsWebRTC: () => 'RTCPeerConnection' in window,
  supportsWebGL: () => {
    try {
      const canvas = document.createElement('canvas');
      return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
    } catch (e) {
      return false;
    }
  },

  // Performance features
  supportsRequestIdleCallback: () => 'requestIdleCallback' in window,
  supportsPerformanceObserver: () => 'PerformanceObserver' in window,
  supportsNavigationTiming: () => 'performance' in window && 'timing' in performance,
  supportsUserTiming: () => 'performance' in window && 'mark' in performance,
  supportsBeacon: () => 'sendBeacon' in navigator,

  // Storage features
  supportsLocalStorage: () => {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  },
  supportsSessionStorage: () => {
    try {
      const test = '__sessionStorage_test__';
      sessionStorage.setItem(test, test);
      sessionStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  },
  supportsIndexedDB: () => 'indexedDB' in window,

  // Network features
  supportsOnlineStatus: () => 'onLine' in navigator,
  supportsConnectionAPI: () =>
    'connection' in navigator || 'mozConnection' in navigator || 'webkitConnection' in navigator,

  // Input features
  supportsTouch: () => 'ontouchstart' in window || navigator.maxTouchPoints > 0,
  supportsClipboard: () => 'clipboard' in navigator,
  supportsDragAndDrop: () => 'draggable' in document.createElement('div'),

  // CSS features
  supportsCSSGrid: () => CSS.supports('display', 'grid'),
  supportsFlexbox: () => CSS.supports('display', 'flex'),
  supportsCustomProperties: () => CSS.supports('color', 'var(--test)'),
  supportsBackdropFilter: () => CSS.supports('backdrop-filter', 'blur(10px)'),
  supportsStickyPosition: () => CSS.supports('position', 'sticky'),

  // JavaScript features
  supportsAsyncAwait: () => {
    try {
      new Function('async () => {}');
      return true;
    } catch (e) {
      return false;
    }
  },
  supportsOptionalChaining: () => {
    try {
      new Function('const obj = {}; obj?.test');
      return true;
    } catch (e) {
      return false;
    }
  },
  supportsNullishCoalescing: () => {
    try {
      new Function('const test = null ?? "default"');
      return true;
    } catch (e) {
      return false;
    }
  },

  // Device capabilities
  isMobile: () => window.innerWidth <= 768,
  isTablet: () => window.innerWidth > 768 && window.innerWidth <= 1024,
  isDesktop: () => window.innerWidth > 1024,
  isHighDPI: () => window.devicePixelRatio > 1,
  isDarkMode: () => window.matchMedia('(prefers-color-scheme: dark)').matches,
  prefersReducedMotion: () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  prefersHighContrast: () => window.matchMedia('(prefers-contrast: high)').matches,
};

// Progressive enhancement wrapper component
interface ProgressiveEnhancementProps {
  children: ReactNode;
  fallback?: ReactNode;
  requiredFeatures: Array<keyof typeof FeatureDetection>;
  detectOnMount?: boolean;
  onFeatureMissing?: (missingFeatures: string[]) => void;
  className?: string;
}

export const ProgressiveEnhancement: React.FC<ProgressiveEnhancementProps> = ({
  children,
  fallback,
  requiredFeatures,
  detectOnMount = true,
  onFeatureMissing,
  className = '',
}) => {
  const [hasAllFeatures, setHasAllFeatures] = useState(true);
  const [missingFeatures, setMissingFeatures] = useState<string[]>([]);

  useEffect(() => {
    if (!detectOnMount) return;

    const missing = requiredFeatures.filter(feature => {
      const featureFunction = FeatureDetection[feature] as () => boolean;
      return !featureFunction();
    });

    const hasFeatures = missing.length === 0;
    setHasAllFeatures(hasFeatures);
    setMissingFeatures(missing);

    if (!hasFeatures && onFeatureMissing) {
      onFeatureMissing(missing);
    }
  }, [requiredFeatures, detectOnMount, onFeatureMissing]);

  if (!hasAllFeatures) {
    return <>{fallback || <FeatureWarning missingFeatures={missingFeatures} />}</>;
  }

  return <div className={className}>{children}</div>;
};

// Feature warning component
interface FeatureWarningProps {
  missingFeatures: string[];
  className?: string;
}

const FeatureWarning: React.FC<FeatureWarningProps> = ({ missingFeatures, className = '' }) => (
  <div className={`p-4 bg-yellow-50 border border-yellow-200 rounded-lg ${className}`}>
    <div className="flex items-center space-x-3">
      <div className="flex-shrink-0">
        <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      <div className="flex-1">
        <h3 className="text-sm font-medium text-yellow-800">Limited Browser Support</h3>
        <p className="mt-1 text-sm text-yellow-700">
          Your browser doesn't support some advanced features. Some functionality may be limited.
        </p>
        <details className="mt-2">
          <summary className="text-xs text-yellow-600 cursor-pointer">
            Missing features ({missingFeatures.length})
          </summary>
          <ul className="mt-1 text-xs text-yellow-600 list-disc list-inside">
            {missingFeatures.map((feature, index) => (
              <li key={index}>{feature.replace(/([A-Z])/g, ' $1').toLowerCase()}</li>
            ))}
          </ul>
        </details>
      </div>
    </div>
  </div>
);

// Conditional rendering based on feature support
interface FeatureProps {
  feature: keyof typeof FeatureDetection;
  children: ReactNode;
  fallback?: ReactNode;
  invert?: boolean;
}

export const Feature: React.FC<FeatureProps> = ({
  feature,
  children,
  fallback,
  invert = false,
}) => {
  const [hasFeature, setHasFeature] = useState(false);

  useEffect(() => {
    const featureFunction = FeatureDetection[feature] as () => boolean;
    const supported = featureFunction();
    setHasFeature(supported);
  }, [feature]);

  if (invert) {
    return <>{hasFeature ? fallback : children}</>;
  }

  return <>{hasFeature ? children : fallback}</>;
};

// Hook for feature detection
export const useFeatureDetection = (features: Array<keyof typeof FeatureDetection>) => {
  const [featureStatus, setFeatureStatus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const status: Record<string, boolean> = {};
    features.forEach(feature => {
      const featureFunction = FeatureDetection[feature] as () => boolean;
      status[feature] = featureFunction();
    });
    setFeatureStatus(status);
  }, features);

  return {
    hasFeatures: Object.values(featureStatus).every(Boolean),
    featureStatus,
    missingFeatures: features.filter(feature => !featureStatus[feature]),
  };
};

// Responsive component with progressive enhancement
interface ResponsiveProps {
  children: ReactNode;
  mobile?: ReactNode;
  tablet?: ReactNode;
  desktop?: ReactNode;
  fallback?: ReactNode;
}

export const Responsive: React.FC<ResponsiveProps> = ({
  children,
  mobile,
  tablet,
  desktop,
  fallback,
}) => {
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  useEffect(() => {
    const updateDeviceType = () => {
      if (FeatureDetection.isMobile()) {
        setDeviceType('mobile');
      } else if (FeatureDetection.isTablet()) {
        setDeviceType('tablet');
      } else {
        setDeviceType('desktop');
      }
    };

    updateDeviceType();
    window.addEventListener('resize', updateDeviceType);
    return () => window.removeEventListener('resize', updateDeviceType);
  }, []);

  const content = deviceType === 'mobile' ? mobile : deviceType === 'tablet' ? tablet : desktop;

  return <>{content || children || fallback}</>;
};

// Theme provider with progressive enhancement
interface ThemeProviderProps {
  children: ReactNode;
  fallbackTheme?: 'light' | 'dark';
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  fallbackTheme = 'light',
}) => {
  const [theme, setTheme] = useState<'light' | 'dark'>(fallbackTheme);
  const [supportsTheme, setSupportsTheme] = useState(false);

  useEffect(() => {
    const supported =
      FeatureDetection.supportsCustomProperties() && FeatureDetection.isDarkMode !== undefined;
    setSupportsTheme(supported);

    if (supported) {
      // Check system preference
      const prefersDark = FeatureDetection.isDarkMode();
      setTheme(prefersDark ? 'dark' : 'light');

      // Listen for theme changes
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        setTheme(e.matches ? 'dark' : 'light');
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);

  if (!supportsTheme) {
    return <div className={`theme-${fallbackTheme}`}>{children}</div>;
  }

  return <div className={`theme-${theme}`}>{children}</div>;
};

// Performance-aware component
interface PerformanceAwareProps {
  children: ReactNode;
  reducedMotion?: ReactNode;
  lowEnd?: ReactNode;
}

export const PerformanceAware: React.FC<PerformanceAwareProps> = ({
  children,
  reducedMotion,
  lowEnd,
}) => {
  const [capabilities, setCapabilities] = useState({
    prefersReducedMotion: false,
    isLowEnd: false,
  });

  useEffect(() => {
    setCapabilities({
      prefersReducedMotion: FeatureDetection.prefersReducedMotion(),
      isLowEnd: !FeatureDetection.supportsWebGL() || !FeatureDetection.supportsCSSGrid(),
    });
  }, []);

  if (capabilities.prefersReducedMotion && reducedMotion) {
    return <>{reducedMotion}</>;
  }

  if (capabilities.isLowEnd && lowEnd) {
    return <>{lowEnd}</>;
  }

  return <>{children}</>;
};

// Network-aware component
interface NetworkAwareProps {
  children: ReactNode;
  offline?: ReactNode;
  slowConnection?: ReactNode;
}

export const NetworkAware: React.FC<NetworkAwareProps> = ({
  children,
  offline,
  slowConnection,
}) => {
  const [networkStatus, setNetworkStatus] = useState({
    isOnline: true,
    isSlow: false,
  });

  useEffect(() => {
    const updateNetworkStatus = () => {
      const isOnline = FeatureDetection.supportsOnlineStatus() ? navigator.onLine : true;
      const isSlow = FeatureDetection.supportsConnectionAPI()
        ? (navigator as any).connection?.effectiveType === 'slow-2g' ||
          (navigator as any).connection?.effectiveType === '2g'
        : false;

      setNetworkStatus({ isOnline, isSlow });
    };

    updateNetworkStatus();

    if (FeatureDetection.supportsOnlineStatus()) {
      window.addEventListener('online', updateNetworkStatus);
      window.addEventListener('offline', updateNetworkStatus);
      return () => {
        window.removeEventListener('online', updateNetworkStatus);
        window.removeEventListener('offline', updateNetworkStatus);
      };
    }
  }, []);

  if (!networkStatus.isOnline && offline) {
    return <>{offline}</>;
  }

  if (networkStatus.isSlow && slowConnection) {
    return <>{slowConnection}</>;
  }

  return <>{children}</>;
};

// Storage provider with fallbacks
interface StorageProviderProps {
  children: ReactNode;
  fallbackStorage?: 'memory' | 'none';
}

export const StorageProvider: React.FC<StorageProviderProps> = ({
  children,
  fallbackStorage = 'memory',
}) => {
  const [storageType, setStorageType] = useState<
    'localStorage' | 'sessionStorage' | 'memory' | 'none'
  >('none');

  useEffect(() => {
    if (FeatureDetection.supportsLocalStorage()) {
      setStorageType('localStorage');
    } else if (FeatureDetection.supportsSessionStorage()) {
      setStorageType('sessionStorage');
    } else {
      setStorageType(fallbackStorage);
    }
  }, [fallbackStorage]);

  const contextValue = {
    storageType,
    isSupported: storageType !== 'none',
    setItem: (key: string, value: any) => {
      if (storageType === 'localStorage') {
        localStorage.setItem(key, JSON.stringify(value));
      } else if (storageType === 'sessionStorage') {
        sessionStorage.setItem(key, JSON.stringify(value));
      }
      // Memory storage would need a separate implementation
    },
    getItem: (key: string) => {
      if (storageType === 'localStorage') {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
      } else if (storageType === 'sessionStorage') {
        const item = sessionStorage.getItem(key);
        return item ? JSON.parse(item) : null;
      }
      return null;
    },
  };

  return <StorageContext.Provider value={contextValue}>{children}</StorageContext.Provider>;
};

const StorageContext = React.createContext<any>(null);

export const useStorage = () => React.useContext(StorageContext);

export default {
  FeatureDetection,
  ProgressiveEnhancement,
  Feature,
  useFeatureDetection,
  Responsive,
  ThemeProvider,
  PerformanceAware,
  NetworkAware,
  StorageProvider,
  useStorage,
};
