import React, { useState, useEffect, useRef, createContext, useContext } from 'react';

interface PerformanceMetrics {
  // Core Web Vitals
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
  timeToInteractive: number;

  // Custom metrics
  renderTime: number;
  apiResponseTime: number;
  memoryUsage: number;
  bundleSize: number;

  // User experience metrics
  errorCount: number;
  crashRate: number;
  retryCount: number;

  // Device and network info
  deviceType: 'mobile' | 'tablet' | 'desktop';
  connectionType: string;
  deviceMemory: number;
}

interface PerformanceContextType {
  metrics: PerformanceMetrics;
  startTiming: (name: string) => void;
  endTiming: (name: string) => number;
  recordMetric: (name: string, value: number) => void;
  recordError: (error: Error) => void;
  isMonitoring: boolean;
  enableMonitoring: () => void;
  disableMonitoring: () => void;
}

const PerformanceContext = createContext<PerformanceContextType | undefined>(undefined);

export const usePerformanceMonitor = () => {
  const context = useContext(PerformanceContext);
  if (!context) {
    throw new Error('usePerformanceMonitor must be used within a PerformanceProvider');
  }
  return context;
};

interface PerformanceProviderProps {
  children: React.ReactNode;
  enableByDefault?: boolean;
  sampleRate?: number;
  reportToAnalytics?: boolean;
  reportInterval?: number;
}

export const PerformanceProvider: React.FC<PerformanceProviderProps> = ({
  children,
  enableByDefault = process.env.NODE_ENV === 'production',
  sampleRate = 1.0,
  reportToAnalytics = true,
  reportInterval = 30000,
}) => {
  const [isMonitoring, setIsMonitoring] = useState(enableByDefault);
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    firstContentfulPaint: 0,
    largestContentfulPaint: 0,
    firstInputDelay: 0,
    cumulativeLayoutShift: 0,
    timeToInteractive: 0,
    renderTime: 0,
    apiResponseTime: 0,
    memoryUsage: 0,
    bundleSize: 0,
    errorCount: 0,
    crashRate: 0,
    retryCount: 0,
    deviceType: 'desktop',
    connectionType: 'unknown',
    deviceMemory: 0,
  });

  const timingsRef = useRef<Map<string, number>>(new Map());
  const metricsRef = useRef<PerformanceMetrics>(metrics);
  const reportTimerRef = useRef<NodeJS.Timeout>();

  // Update metrics ref whenever metrics state changes
  useEffect(() => {
    metricsRef.current = metrics;
  }, [metrics]);

  // Collect device information
  const collectDeviceInfo = () => {
    const width = window.innerWidth;
    let deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop';

    if (width <= 768) {
      deviceType = 'mobile';
    } else if (width <= 1024) {
      deviceType = 'tablet';
    }

    const connection = (navigator as any).connection;
    const connectionType = connection ? connection.effectiveType : 'unknown';
    const deviceMemory = (navigator as any).deviceMemory || 0;

    setMetrics(prev => ({
      ...prev,
      deviceType,
      connectionType,
      deviceMemory,
    }));
  };

  // Measure Core Web Vitals
  const measureCoreWebVitals = () => {
    // First Contentful Paint
    const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0] as PerformanceEntry;
    if (fcpEntry) {
      recordMetric('firstContentfulPaint', fcpEntry.startTime);
    }

    // Largest Contentful Paint
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver(list => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        if (lastEntry) {
          recordMetric('largestContentfulPaint', lastEntry.startTime);
        }
      });
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    }

    // First Input Delay
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver(list => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (entry.processingStart) {
            recordMetric('firstInputDelay', entry.processingStart - entry.startTime);
          }
        });
      });
      observer.observe({ entryTypes: ['first-input'] });
    }

    // Cumulative Layout Shift
    if ('PerformanceObserver' in window) {
      let clsValue = 0;
      const observer = new PerformanceObserver(list => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            recordMetric('cumulativeLayoutShift', clsValue);
          }
        });
      });
      observer.observe({ entryTypes: ['layout-shift'] });
    }

    // Time to Interactive
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      const tti = navigation.domInteractive - navigation.navigationStart;
      recordMetric('timeToInteractive', tti);
    }
  };

  // Measure memory usage
  const measureMemoryUsage = () => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const usedMemory = memory.usedJSHeapSize / 1024 / 1024; // Convert to MB
      recordMetric('memoryUsage', usedMemory);
    }
  };

  // Measure API response times
  const measureApiResponseTime = () => {
    // Override fetch to measure API calls
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const start = performance.now();
      try {
        const response = await originalFetch(...args);
        const end = performance.now();
        const duration = end - start;

        // Only measure API calls (our own endpoints)
        if (args[0] && typeof args[0] === 'string' && args[0].includes('/api/')) {
          recordMetric('apiResponseTime', duration);
        }

        return response;
      } catch (error) {
        const end = performance.now();
        const duration = end - start;
        recordMetric('apiResponseTime', duration);
        throw error;
      }
    };
  };

  // Timing utilities
  const startTiming = (name: string) => {
    timingsRef.current.set(name, performance.now());
  };

  const endTiming = (name: string): number => {
    const startTime = timingsRef.current.get(name);
    if (startTime) {
      const duration = performance.now() - startTime;
      timingsRef.current.delete(name);
      recordMetric(`timing_${name}`, duration);
      return duration;
    }
    return 0;
  };

  const recordMetric = (name: string, value: number) => {
    if (!isMonitoring) return;

    setMetrics(prev => {
      const newMetrics = { ...prev };

      switch (name) {
        case 'firstContentfulPaint':
          newMetrics.firstContentfulPaint = value;
          break;
        case 'largestContentfulPaint':
          newMetrics.largestContentfulPaint = value;
          break;
        case 'firstInputDelay':
          newMetrics.firstInputDelay = value;
          break;
        case 'cumulativeLayoutShift':
          newMetrics.cumulativeLayoutShift = value;
          break;
        case 'timeToInteractive':
          newMetrics.timeToInteractive = value;
          break;
        case 'renderTime':
          newMetrics.renderTime = value;
          break;
        case 'apiResponseTime':
          newMetrics.apiResponseTime = value;
          break;
        case 'memoryUsage':
          newMetrics.memoryUsage = value;
          break;
        case 'bundleSize':
          newMetrics.bundleSize = value;
          break;
        default:
          // Handle custom timing metrics
          if (name.startsWith('timing_')) {
            // Update existing metric or add new one
            const timingName = (name.replace('timing_', '')(newMetrics as any)[timingName] = value);
          }
      }

      return newMetrics;
    });
  };

  const recordError = (error: Error) => {
    if (!isMonitoring) return;

    setMetrics(prev => ({
      ...prev,
      errorCount: prev.errorCount + 1,
    }));
  };

  // Report metrics to analytics
  const reportMetrics = () => {
    if (!reportToAnalytics || !isMonitoring) return;

    const data = {
      ...metricsRef.current,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    // Send to Google Analytics
    if (typeof gtag !== 'undefined') {
      Object.entries(data).forEach(([key, value]) => {
        if (typeof value === 'number') {
          gtag('event', 'performance_metric', {
            metric_name: key,
            metric_value: value,
            custom_map: { metric_name: key },
          });
        }
      });
    }

    // Send to custom endpoint
    fetch('/api/performance/metrics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }).catch(error => {
      console.error('Failed to report performance metrics:', error);
    });
  };

  const enableMonitoring = () => {
    setIsMonitoring(true);
  };

  const disableMonitoring = () => {
    setIsMonitoring(false);
  };

  // Initialize monitoring
  useEffect(() => {
    if (!isMonitoring) return;

    collectDeviceInfo();
    measureCoreWebVitals();
    measureApiResponseTime();

    // Measure memory usage periodically
    const memoryInterval = setInterval(measureMemoryUsage, 10000);

    // Set up periodic reporting
    reportTimerRef.current = setInterval(reportMetrics, reportInterval);

    // Measure page load performance
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType(
          'navigation'
        )[0] as PerformanceNavigationTiming;
        if (navigation) {
          const loadTime = navigation.loadEventEnd - navigation.navigationStart;
          recordMetric('pageLoadTime', loadTime);
        }
      }, 0);
    });

    return () => {
      clearInterval(memoryInterval);
      if (reportTimerRef.current) {
        clearInterval(reportTimerRef.current);
      }
    };
  }, [isMonitoring, reportInterval]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (reportTimerRef.current) {
        clearInterval(reportTimerRef.current);
      }
    };
  }, []);

  return (
    <PerformanceContext.Provider
      value={{
        metrics,
        startTiming,
        endTiming,
        recordMetric,
        recordError,
        isMonitoring,
        enableMonitoring,
        disableMonitoring,
      }}
    >
      {children}
    </PerformanceContext.Provider>
  );
};

// Performance Metrics Display Component
export const PerformanceMetricsDisplay: React.FC<{
  showOnlyInDevelopment?: boolean;
  className?: string;
}> = ({ showOnlyInDevelopment = true, className = '' }) => {
  const { metrics, isMonitoring } = usePerformanceMonitor();

  if (showOnlyInDevelopment && process.env.NODE_ENV !== 'development') {
    return null;
  }

  if (!isMonitoring) {
    return null;
  }

  const getScoreColor = (value: number, thresholds: { good: number; poor: number }) => {
    if (value <= thresholds.good) return 'text-green-600';
    if (value <= thresholds.poor) return 'text-yellow-600';
    return 'text-red-600';
  };

  const fcpColor = getScoreColor(metrics.firstContentfulPaint, { good: 1800, poor: 3000 });
  const lcpColor = getScoreColor(metrics.largestContentfulPaint, { good: 2500, poor: 4000 });
  const fidColor = getScoreColor(metrics.firstInputDelay, { good: 100, poor: 300 });
  const clsColor = getScoreColor(metrics.cumulativeLayoutShift, { good: 0.1, poor: 0.25 });

  return (
    <div
      className={`fixed bottom-4 right-4 bg-black bg-opacity-80 text-white text-xs p-4 rounded-lg max-w-sm z-50 ${className}`}
    >
      <div className="font-semibold mb-3 text-yellow-400">Performance Metrics</div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <span>FCP:</span>
          <span className={fcpColor}>{Math.round(metrics.firstContentfulPaint)}ms</span>
        </div>

        <div className="flex justify-between">
          <span>LCP:</span>
          <span className={lcpColor}>{Math.round(metrics.largestContentfulPaint)}ms</span>
        </div>

        <div className="flex justify-between">
          <span>FID:</span>
          <span className={fidColor}>{Math.round(metrics.firstInputDelay)}ms</span>
        </div>

        <div className="flex justify-between">
          <span>CLS:</span>
          <span className={clsColor}>{metrics.cumulativeLayoutShift.toFixed(3)}</span>
        </div>

        <div className="flex justify-between">
          <span>Memory:</span>
          <span>{metrics.memoryUsage.toFixed(1)}MB</span>
        </div>

        <div className="flex justify-between">
          <span>Errors:</span>
          <span className={metrics.errorCount > 0 ? 'text-red-400' : 'text-green-400'}>
            {metrics.errorCount}
          </span>
        </div>

        <div className="flex justify-between">
          <span>Device:</span>
          <span>{metrics.deviceType}</span>
        </div>

        <div className="flex justify-between">
          <span>Connection:</span>
          <span>{metrics.connectionType}</span>
        </div>
      </div>
    </div>
  );
};

// Performance Hook for components
export const usePerformanceTiming = (componentName: string) => {
  const { startTiming, endTiming, recordMetric } = usePerformanceMonitor();

  useEffect(() => {
    startTiming(`${componentName}_mount`);
    return () => {
      const duration = endTiming(`${componentName}_mount`);
      recordMetric(`${componentName}_lifetime`, duration);
    };
  }, [componentName, startTiming, endTiming, recordMetric]);

  return {
    startTiming: (name: string) => startTiming(`${componentName}_${name}`),
    endTiming: (name: string) => endTiming(`${componentName}_${name}`),
    recordMetric: (name: string, value: number) => recordMetric(`${componentName}_${name}`, value),
  };
};

// Performance Monitoring HOC
export const withPerformanceMonitoring = <P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string
) => {
  const WrappedComponent = (props: P) => {
    const name = componentName || Component.displayName || Component.name || 'Unknown';
    usePerformanceTiming(name);

    return <Component {...props} />;
  };

  WrappedComponent.displayName = `withPerformanceMonitoring(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

export default PerformanceProvider;
