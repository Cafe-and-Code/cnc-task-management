import React, { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
  retryCount: number;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo, errorId: string) => void;
  maxRetries?: number;
  showErrorDetails?: boolean;
  enableRetry?: boolean;
  logToService?: boolean;
  componentName?: string;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });

    // Log error details
    this.logError(error, errorInfo);

    // Call custom error handler
    this.props.onError?.(error, errorInfo, this.state.errorId);
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  private logError = (error: Error, errorInfo: ErrorInfo) => {
    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      componentName: this.props.componentName || 'Unknown',
      retryCount: this.state.retryCount,
    };

    // Console logging in development
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚨 Error Boundary - ${this.props.componentName || 'Component'}`);
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Error ID:', this.state.errorId);
      console.groupEnd();
    }

    // Send to error reporting service
    if (this.props.logToService) {
      this.sendErrorToService(errorData);
    }

    // Store in localStorage for debugging
    try {
      const recentErrors = JSON.parse(localStorage.getItem('recentErrors') || '[]');
      recentErrors.unshift(errorData);
      // Keep only last 10 errors
      const trimmedErrors = recentErrors.slice(0, 10);
      localStorage.setItem('recentErrors', JSON.stringify(trimmedErrors));
    } catch (e) {
      console.error('Failed to store error in localStorage:', e);
    }
  };

  private sendErrorToService = async (errorData: any) => {
    try {
      // Send to error tracking service (e.g., Sentry, LogRocket)
      if (typeof window.gtag === 'function') {
        // Google Analytics event
        window.gtag('event', 'exception', {
          description: errorData.message,
          fatal: false,
          custom_map: {
            error_id: errorData.errorId,
            component_name: errorData.componentName,
          },
        });
      }

      // Send to custom endpoint
      await fetch('/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorData),
      });
    } catch (e) {
      console.error('Failed to send error to service:', e);
    }
  };

  private handleRetry = () => {
    const maxRetries = this.props.maxRetries || 3;

    if (this.state.retryCount < maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1,
      }));

      // Add small delay before retry
      this.retryTimeoutId = setTimeout(() => {
        // Force re-render
        this.forceUpdate();
      }, 1000);
    } else {
      console.warn('Max retries reached for error:', this.state.error?.message);
    }
  };

  private handleReload = () => {
    window.location.reload();
  };

  private reportError = () => {
    const { error, errorInfo, errorId } = this.state;
    const errorReport = {
      errorId,
      message: error?.message,
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
    };

    // Copy error report to clipboard
    navigator.clipboard
      .writeText(JSON.stringify(errorReport, null, 2))
      .then(() => {
        alert('Error report copied to clipboard!');
      })
      .catch(() => {
        alert('Failed to copy error report');
      });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback component
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-[200px] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-red-200 dark:border-red-800">
            <div className="text-center">
              {/* Error Icon */}
              <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-red-600 dark:text-red-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>

              {/* Error Title */}
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Something went wrong
              </h3>

              {/* Error Message */}
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                {this.state.error?.message || 'An unexpected error occurred'}
              </p>

              {/* Error ID */}
              <p className="text-xs text-gray-500 dark:text-gray-500 mb-6">
                Error ID: {this.state.errorId}
              </p>

              {/* Action Buttons */}
              <div className="space-y-3">
                {this.props.enableRetry && (
                  <button
                    onClick={this.handleRetry}
                    disabled={this.state.retryCount >= (this.props.maxRetries || 3)}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {this.state.retryCount >= (this.props.maxRetries || 3)
                      ? 'Max retries reached'
                      : `Retry${this.state.retryCount > 0 ? ` (${this.state.retryCount}/${this.props.maxRetries || 3})` : ''}`}
                  </button>
                )}

                <button
                  onClick={this.handleReload}
                  className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Reload Page
                </button>

                {this.props.showErrorDetails && (
                  <details className="text-left">
                    <summary className="cursor-pointer text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
                      Technical Details
                    </summary>
                    <div className="mt-3 p-3 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono text-gray-800 dark:text-gray-200 max-h-32 overflow-y-auto">
                      <div className="mb-2">
                        <strong>Error:</strong> {this.state.error?.message}
                      </div>
                      {this.state.error?.stack && (
                        <div className="mb-2">
                          <strong>Stack:</strong>
                          <pre className="whitespace-pre-wrap break-words">
                            {this.state.error?.stack}
                          </pre>
                        </div>
                      )}
                      {this.state.errorInfo?.componentStack && (
                        <div>
                          <strong>Component Stack:</strong>
                          <pre className="whitespace-pre-wrap break-words">
                            {this.state.errorInfo?.componentStack}
                          </pre>
                        </div>
                      )}
                    </div>
                  </details>
                )}

                {process.env.NODE_ENV === 'development' && (
                  <button
                    onClick={this.reportError}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                  >
                    Copy Error Report
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Functional Error Boundary Hook for smaller components
export const useErrorHandler = () => {
  return React.useCallback((error: Error, errorInfo?: ErrorInfo) => {
    console.error('Error caught by error handler:', error, errorInfo);

    // Send to error tracking service
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'exception', {
        description: error.message,
        fatal: false,
      });
    }
  }, []);
};

// Async Error Boundary for async operations
export const AsyncErrorBoundary: React.FC<{
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error) => void;
}> = ({ children, fallback, onError }) => {
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      setError(event.reason instanceof Error ? event.reason : new Error(String(event.reason)));
      onError?.(event.reason instanceof Error ? event.reason : new Error(String(event.reason)));
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    return () => window.removeEventListener('unhandledrejection', handleUnhandledRejection);
  }, [onError]);

  if (error) {
    return (
      <ErrorBoundary fallback={fallback}>
        <div className="p-4 text-center">
          <h3 className="text-lg font-semibold text-red-600 mb-2">Async Error</h3>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <button
            onClick={() => setError(null)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Dismiss
          </button>
        </div>
      </ErrorBoundary>
    );
  }

  return <>{children}</>;
};

// Route-level Error Boundary
export const RouteErrorBoundary: React.FC<{
  children: ReactNode;
  fallback?: ReactNode;
}> = ({ children, fallback }) => {
  const location = window.location;

  return (
    <ErrorBoundary
      fallback={fallback}
      logToService={true}
      componentName={`Route-${location.pathname}`}
      onError={(error, errorInfo, errorId) => {
        console.error(`Route error in ${location.pathname}:`, error);
      }}
    >
      {children}
    </ErrorBoundary>
  );
};

// Component-level Error Boundary HOC
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Partial<ErrorBoundaryProps>
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

export default ErrorBoundary;
