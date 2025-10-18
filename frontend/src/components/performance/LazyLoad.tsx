import React, { Suspense, lazy, ComponentType, ReactNode } from 'react';
import { ErrorBoundary } from './ErrorBoundary';

interface LazyComponentProps {
  loader: () => Promise<{ default: ComponentType<any> }>;
  fallback?: ReactNode;
  errorFallback?: ReactNode;
  delay?: number;
  preload?: boolean;
}

// Enhanced lazy component with error handling and preloading
export const LazyComponent: React.FC<LazyComponentProps> = ({
  loader,
  fallback = <LoadingSpinner />,
  errorFallback = <ErrorFallback />,
  delay = 200,
  preload = false,
}) => {
  const LazyComp = lazy(() =>
    loader().catch(error => {
      console.error('Failed to load component:', error);
      // Return a default error component
      return {
        default: () => errorFallback,
      };
    })
  );

  if (preload) {
    // Preload the component
    loader();
  }

  return (
    <ErrorBoundary fallback={errorFallback}>
      <Suspense fallback={<DelayedFallback delay={delay}>{fallback}</DelayedFallback>}>
        <LazyComp />
      </Suspense>
    </ErrorBoundary>
  );
};

// Delayed fallback component to prevent flickering
const DelayedFallback: React.FC<{ children: ReactNode; delay: number }> = ({ children, delay }) => {
  const [showFallback, setShowFallback] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShowFallback(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  if (!showFallback) {
    return null;
  }

  return <>{children}</>;
};

// Loading spinner component
const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

// Error fallback component
const ErrorFallback: React.FC = () => (
  <div className="flex items-center justify-center p-8">
    <div className="text-center">
      <div className="text-red-500 text-4xl mb-4">⚠️</div>
      <div className="text-gray-600">Failed to load component</div>
      <button
        onClick={() => window.location.reload()}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Retry
      </button>
    </div>
  </div>
);

// Predefined lazy components for common routes
export const LazyDashboard = lazy(() => import('@pages/DashboardPage'));
export const LazyProjects = lazy(() => import('@pages/projects/ProjectsPage'));
export const LazyProjectDetail = lazy(() => import('@pages/projects/ProjectDetailPage'));
export const LazySprints = lazy(() => import('@pages/sprints/SprintsPage'));
export const LazySprintDetail = lazy(() => import('@pages/sprints/SprintDetailPage'));
export const LazyKanban = lazy(() => import('@pages/kanban/KanbanPage'));
export const LazyTasks = lazy(() => import('@pages/tasks/TaskDetailPage'));
export const LazyTeams = lazy(() => import('@pages/teams/TeamsPage'));
export const LazyTeamDetail = lazy(() => import('@pages/teams/TeamDetailPage'));
export const LazyReports = lazy(() => import('@pages/reports/ReportsDashboardPage'));
export const LazyProfile = lazy(() => import('@pages/ProfilePage'));
export const LazyAdmin = lazy(() => import('@pages/admin/AdminDashboardPage'));

// Lazy loaded admin components
export const LazyUserManagement = lazy(() => import('@pages/admin/UserManagementPage'));
export const LazyOrganizationManagement = lazy(
  () => import('@pages/admin/OrganizationManagementPage')
);
export const LazySystemHealth = lazy(() => import('@pages/admin/SystemHealthPage'));
export const LazyUsageAnalytics = lazy(() => import('@pages/admin/UsageAnalyticsPage'));
export const LazySecuritySettings = lazy(() => import('@pages/admin/SecuritySettingsPage'));
export const LazyBackupRestore = lazy(() => import('@pages/admin/BackupRestorePage'));
export const LazySystemConfiguration = lazy(() => import('@pages/admin/SystemConfigurationPage'));
export const LazyAuditLog = lazy(() => import('@pages/admin/AuditLogPage'));
export const LazyEmergencyMaintenance = lazy(() => import('@pages/admin/EmergencyMaintenancePage'));

// Lazy loaded components for different features
export const LazyReportsBuilder = lazy(() => import('@components/reports/ReportBuilder'));
export const LazyProjectForm = lazy(() => import('@components/projects/ProjectForm'));
export const LazyTaskForm = lazy(() => import('@components/tasks/TaskForm'));
export const LazyTeamForm = lazy(() => import('@components/teams/TeamForm'));
export const LazySprintForm = lazy(() => import('@components/sprints/SprintForm'));
export const LazyUserStoryForm = lazy(() => import('@components/backlog/UserStoryForm'));

// Preload management utilities
export class PreloadManager {
  private static preloadedComponents = new Set<string>();
  private static preloadPromises = new Map<string, Promise<any>>();

  // Preload a component
  static preload(componentName: string, loader: () => Promise<any>): Promise<any> {
    if (this.preloadedComponents.has(componentName)) {
      return this.preloadPromises.get(componentName) || Promise.resolve();
    }

    const promise = loader()
      .then(module => {
        this.preloadedComponents.add(componentName);
        return module;
      })
      .catch(error => {
        console.error(`Failed to preload ${componentName}:`, error);
        throw error;
      });

    this.preloadPromises.set(componentName, promise);
    return promise;
  }

  // Preload components based on user behavior
  static preloadOnHover(element: HTMLElement, componentName: string, loader: () => Promise<any>) {
    let timeoutId: NodeJS.Timeout;

    element.addEventListener('mouseenter', () => {
      timeoutId = setTimeout(() => {
        this.preload(componentName, loader);
      }, 100); // Small delay to avoid unnecessary preloads
    });

    element.addEventListener('mouseleave', () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    });
  }

  // Preload components on route prefetch
  static preloadOnRoute(route: string, loader: () => Promise<any>) {
    const componentName = route.replace(/\//g, '-');
    return this.preload(componentName, loader);
  }

  // Preload critical components
  static preloadCritical() {
    // Preload components that are likely to be used soon
    const criticalComponents = [
      { name: 'projects', loader: () => import('@pages/projects/ProjectsPage') },
      { name: 'tasks', loader: () => import('@pages/tasks/TaskDetailPage') },
      { name: 'sprints', loader: () => import('@pages/sprints/SprintsPage') },
    ];

    criticalComponents.forEach(({ name, loader }) => {
      // Use setTimeout to avoid blocking initial load
      setTimeout(() => {
        this.preload(name, loader);
      }, 2000);
    });
  }

  // Clear preloaded components (useful for memory management)
  static clearPreloaded() {
    this.preloadedComponents.clear();
    this.preloadPromises.clear();
  }
}

// Intersection Observer for lazy loading
export const useIntersectionObserver = (
  ref: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
) => {
  const [isIntersecting, setIsIntersecting] = React.useState(false);

  React.useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options,
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [ref, options.threshold, options.rootMargin]);

  return isIntersecting;
};

// Lazy image component with intersection observer
export const LazyImage: React.FC<{
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
}> = ({ src, alt, className, placeholder, onLoad, onError }) => {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);
  const imgRef = React.useRef<HTMLImageElement>(null);
  const shouldLoad = useIntersectionObserver(imgRef);

  React.useEffect(() => {
    if (shouldLoad && !isLoaded && !hasError) {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        setIsLoaded(true);
        onLoad?.();
      };
      img.onerror = () => {
        setHasError(true);
        onError?.();
      };
    }
  }, [shouldLoad, isLoaded, hasError, src, onLoad, onError]);

  if (hasError) {
    return (
      <div className={`flex items-center justify-center bg-gray-200 ${className}`}>
        <span className="text-gray-500">Failed to load image</span>
      </div>
    );
  }

  return (
    <div ref={imgRef} className={className}>
      {!isLoaded && placeholder && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse">{placeholder}</div>
      )}
      {isLoaded && (
        <img src={src} alt={alt} className={className} onLoad={onLoad} onError={onError} />
      )}
    </div>
  );
};

// Route-based code splitting HOC
export const withCodeSplitting = <P extends object>(
  Component: ComponentType<P>,
  fallback?: ReactNode
) => {
  const WrappedComponent = (props: P) => (
    <Suspense fallback={fallback || <LoadingSpinner />}>
      <Component {...props} />
    </Suspense>
  );

  WrappedComponent.displayName = `withCodeSplitting(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

// Progressive loading for heavy components
export const ProgressiveLoader: React.FC<{
  children: ReactNode;
  steps?: Array<{
    component: ReactNode;
    delay: number;
  }>;
}> = ({ children, steps = [] }) => {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (currentStep < steps.length) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, steps[currentStep].delay);

      return () => clearTimeout(timer);
    } else {
      setIsLoading(false);
    }
  }, [currentStep, steps]);

  if (isLoading && steps.length > 0) {
    return <>{steps[currentStep]?.component}</>;
  }

  return <>{children}</>;
};

// Bundle analyzer utilities
export const BundleAnalyzer = {
  // Get current bundle size (approximation)
  getBundleSize: async () => {
    try {
      const response = await fetch('/static/js/bundle.js');
      const contentLength = response.headers.get('content-length');
      return contentLength ? parseInt(contentLength) : 0;
    } catch (error) {
      console.error('Failed to get bundle size:', error);
      return 0;
    }
  },

  // Analyze component load times
  trackComponentLoad: (componentName: string, loadTime: number) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`Component ${componentName} loaded in ${loadTime}ms`);
    }
    // Send to analytics in production
    if (typeof gtag !== 'undefined') {
      gtag('event', 'component_load', {
        component_name: componentName,
        load_time: loadTime,
      });
    }
  },
};

export default LazyComponent;
