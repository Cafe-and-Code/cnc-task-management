import React, { useState, useEffect, createContext, useContext } from 'react';

interface PerformanceContextType {
  isLowEndDevice: boolean;
  isSlowConnection: boolean;
  enableAnimations: boolean;
  enableImages: boolean;
  enableVideos: boolean;
  compressionLevel: 'low' | 'medium' | 'high';
  setPerformanceMode: (mode: 'high' | 'medium' | 'low') => void;
}

const PerformanceContext = createContext<PerformanceContextType | undefined>(undefined);

export const usePerformance = () => {
  const context = useContext(PerformanceContext);
  if (!context) {
    throw new Error('usePerformance must be used within a PerformanceProvider');
  }
  return context;
};

interface PerformanceProviderProps {
  children: React.ReactNode;
}

export const PerformanceProvider: React.FC<PerformanceProviderProps> = ({ children }) => {
  const [isLowEndDevice, setIsLowEndDevice] = useState(false);
  const [isSlowConnection, setIsSlowConnection] = useState(false);
  const [enableAnimations, setEnableAnimations] = useState(true);
  const [enableImages, setEnableImages] = useState(true);
  const [enableVideos, setEnableVideos] = useState(true);
  const [compressionLevel, setCompressionLevel] = useState<'low' | 'medium' | 'high'>('medium');

  useEffect(() => {
    // Detect device performance
    const detectDevicePerformance = () => {
      // Check hardware concurrency (CPU cores)
      const cpuCores = navigator.hardwareConcurrency || 4;
      const lowCPUCores = cpuCores <= 2;

      // Check device memory (if available)
      const deviceMemory = (navigator as any).deviceMemory || 4;
      const lowMemory = deviceMemory <= 2;

      // Check connection speed
      const connection =
        (navigator as any).connection ||
        (navigator as any).mozConnection ||
        (navigator as any).webkitConnection;
      const slowConnection = connection
        ? connection.effectiveType === 'slow-2g' ||
          connection.effectiveType === '2g' ||
          connection.downlink < 0.5
        : false;

      // Check for reduced motion preference
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // Check for save data preference
      const prefersSaveData = connection ? connection.saveData : false;

      setIsLowEndDevice(lowCPUCores || lowMemory);
      setIsSlowConnection(slowConnection || prefersSaveData);
      setEnableAnimations(!prefersReducedMotion && !lowCPUCores);
      setEnableImages(!prefersSaveData);
      setEnableVideos(!prefersSaveData && !slowConnection);

      // Set compression level based on connection and device
      if (slowConnection || lowCPUCores) {
        setCompressionLevel('high');
      } else if (prefersSaveData) {
        setCompressionLevel('medium');
      } else {
        setCompressionLevel('low');
      }
    };

    detectDevicePerformance();

    // Listen for connection changes
    const connection =
      (navigator as any).connection ||
      (navigator as any).mozConnection ||
      (navigator as any).webkitConnection;
    if (connection) {
      connection.addEventListener('change', detectDevicePerformance);
      return () => {
        connection.removeEventListener('change', detectDevicePerformance);
      };
    }
  }, []);

  const setPerformanceMode = (mode: 'high' | 'medium' | 'low') => {
    switch (mode) {
      case 'high':
        setEnableAnimations(true);
        setEnableImages(true);
        setEnableVideos(true);
        setCompressionLevel('low');
        break;
      case 'medium':
        setEnableAnimations(false);
        setEnableImages(true);
        setEnableVideos(false);
        setCompressionLevel('medium');
        break;
      case 'low':
        setEnableAnimations(false);
        setEnableImages(false);
        setEnableVideos(false);
        setCompressionLevel('high');
        break;
    }
  };

  return (
    <PerformanceContext.Provider
      value={{
        isLowEndDevice,
        isSlowConnection,
        enableAnimations,
        enableImages,
        enableVideos,
        compressionLevel,
        setPerformanceMode,
      }}
    >
      {children}
    </PerformanceContext.Provider>
  );
};

// Lazy Load Component
export const LazyLoad: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
  rootMargin?: string;
  threshold?: number;
  className?: string;
}> = ({
  children,
  fallback = <div className="animate-pulse bg-gray-200 rounded" />,
  rootMargin = '50px',
  threshold = 0.1,
  className = '',
}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const elementRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasLoaded) {
          setIsIntersecting(true);
          setHasLoaded(true);
        }
      },
      {
        rootMargin,
        threshold,
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [rootMargin, threshold, hasLoaded]);

  return (
    <div ref={elementRef} className={className}>
      {isIntersecting ? children : fallback}
    </div>
  );
};

// Optimized Image Component
export const OptimizedImage: React.FC<{
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  lazy?: boolean;
  priority?: boolean;
  sizes?: string;
  quality?: number;
}> = ({
  src,
  alt,
  width,
  height,
  className = '',
  lazy = true,
  priority = false,
  sizes = '100vw',
  quality = 75,
}) => {
  const { enableImages, compressionLevel } = usePerformance();
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  // Generate optimized src based on compression level
  const getOptimizedSrc = (originalSrc: string) => {
    if (!enableImages) {
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDNi40NzcyIDIgMiA2LjQ3NzIgMiAxMlM2LjQ3NzIgMjIgMTIgMjJTMjIgMTcuNTIyOCAyMiAxMlMxNy41MjI4IDIgMTIgMloiIGZpbGw9IiNFMkU4RjAiLz4KPHBhdGggZD0iTTggMTJIMTBWMTRIOFYxMloiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+';
    }

    // In a real app, this would use a CDN or image optimization service
    const qualityMap = {
      low: 40,
      medium: 75,
      high: 90,
    };

    const finalQuality = qualityMap[compressionLevel];
    const params = new URLSearchParams({
      q: finalQuality.toString(),
      auto: 'format',
      fit: 'crop',
    });

    // Add dimensions if provided
    if (width && height) {
      params.set('w', width.toString());
      params.set('h', height.toString());
    }

    const separator = src.includes('?') ? '&' : '?';
    return `${src}${separator}${params.toString()}`;
  };

  const optimizedSrc = getOptimizedSrc(src);

  if (!enableImages) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded ${className}`}
      >
        <svg
          className="w-12 h-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded ${className}`}
      >
        <span className="text-gray-500 text-sm">Image not available</span>
      </div>
    );
  }

  return (
    <LazyLoad
      fallback={
        <div className={`bg-gray-200 dark:bg-gray-700 rounded animate-pulse ${className}`} />
      }
    >
      <img
        src={optimizedSrc}
        alt={alt}
        width={width}
        height={height}
        className={`${className} transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        loading={lazy && !priority ? 'lazy' : 'eager'}
        sizes={sizes}
        onLoad={() => setIsLoaded(true)}
        onError={() => setError(true)}
      />
    </LazyLoad>
  );
};

// Performance Monitor Component
export const PerformanceMonitor: React.FC<{
  onPerformanceUpdate?: (metrics: PerformanceMetrics) => void;
}> = ({ onPerformanceUpdate }) => {
  const { isLowEndDevice, isSlowConnection } = usePerformance();
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    connectionSpeed: 'unknown',
  });

  interface PerformanceMetrics {
    loadTime: number;
    renderTime: number;
    memoryUsage: number;
    connectionSpeed: string;
  }

  useEffect(() => {
    const measurePerformance = () => {
      // Measure page load time
      const navigation = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming;
      const loadTime = navigation.loadEventEnd - navigation.loadEventStart;

      // Measure memory usage (if available)
      const memoryInfo = (performance as any).memory;
      const memoryUsage = memoryInfo ? memoryInfo.usedJSHeapSize / 1024 / 1024 : 0;

      // Get connection information
      const connection = (navigator as any).connection;
      const connectionSpeed = connection ? connection.effectiveType : 'unknown';

      const newMetrics = {
        loadTime,
        renderTime: 0, // Would need to measure render time separately
        memoryUsage,
        connectionSpeed,
      };

      setMetrics(newMetrics);
      onPerformanceUpdate?.(newMetrics);
    };

    // Wait for page to fully load
    if (document.readyState === 'complete') {
      measurePerformance();
    } else {
      window.addEventListener('load', measurePerformance);
      return () => window.removeEventListener('load', measurePerformance);
    }
  }, [onPerformanceUpdate]);

  // Only show in development or for low-end devices
  if (process.env.NODE_ENV !== 'development' && !isLowEndDevice && !isSlowConnection) {
    return null;
  }

  return (
    <div className="fixed top-16 left-2 z-50 bg-black bg-opacity-80 text-white text-xs p-2 rounded-lg max-w-xs">
      <div className="font-semibold mb-1">Performance Info</div>
      <div>Load Time: {metrics.loadTime}ms</div>
      <div>Memory: {metrics.memoryUsage.toFixed(1)}MB</div>
      <div>Connection: {metrics.connectionSpeed}</div>
      <div>Device: {isLowEndDevice ? 'Low-end' : 'High-end'}</div>
    </div>
  );
};

// Network Optimizer Hook
export const useNetworkOptimizer = () => {
  const { isSlowConnection, compressionLevel } = usePerformance();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const optimizeFetch = async (url: string, options: RequestInit = {}) => {
    const optimizedOptions: RequestInit = {
      ...options,
      headers: {
        ...options.headers,
        'X-Compression-Level': compressionLevel,
        'X-Device-Performance': isLowEndDevice ? 'low' : 'high',
        ...(!isOnline && { 'X-Offline-Mode': 'true' }),
      },
    };

    try {
      const response = await fetch(url, optimizedOptions);
      return response;
    } catch (error) {
      if (!isOnline) {
        // Handle offline scenario
        console.warn('Request failed - device offline');
        throw new Error('Device is offline');
      }
      throw error;
    }
  };

  return {
    isOnline,
    isSlowConnection,
    optimizeFetch,
    shouldPreload: !isSlowConnection && isOnline,
    shouldCache: isSlowConnection || !isOnline,
  };
};

// Resource Preloader Component
export const ResourcePreloader: React.FC<{
  resources: Array<{
    url: string;
    type: 'script' | 'style' | 'image' | 'font';
    priority?: 'high' | 'low';
  }>;
}> = ({ resources }) => {
  const { shouldPreload } = useNetworkOptimizer();

  useEffect(() => {
    if (!shouldPreload) return;

    const preloadResource = (resource: (typeof resources)[0]) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource.url;

      switch (resource.type) {
        case 'script':
          link.as = 'script';
          break;
        case 'style':
          link.as = 'style';
          break;
        case 'image':
          link.as = 'image';
          break;
        case 'font':
          link.as = 'font';
          link.type = 'font/woff2';
          link.crossOrigin = 'anonymous';
          break;
      }

      if (resource.priority === 'high') {
        link.setAttribute('importance', 'high');
      }

      document.head.appendChild(link);
    };

    resources.forEach(resource => {
      // Add delay for low priority resources
      if (resource.priority === 'low') {
        setTimeout(() => preloadResource(resource), 2000);
      } else {
        preloadResource(resource);
      }
    });
  }, [resources, shouldPreload]);

  return null;
};
