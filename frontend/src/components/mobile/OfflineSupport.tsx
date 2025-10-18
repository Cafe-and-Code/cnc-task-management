import React, { useState, useEffect, createContext, useContext } from 'react';

interface OfflineContextType {
  isOnline: boolean;
  isOfflineMode: boolean;
  queue: Array<{
    id: string;
    url: string;
    method: string;
    data?: any;
    timestamp: number;
    retryCount: number;
  }>;
  addToQueue: (item: { url: string; method: string; data?: any }) => void;
  clearQueue: () => void;
  syncQueue: () => Promise<void>;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export const useOffline = () => {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
};

interface OfflineProviderProps {
  children: React.ReactNode;
}

export const OfflineProvider: React.FC<OfflineProviderProps> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queue, setQueue] = useState<
    Array<{
      id: string;
      url: string;
      method: string;
      data?: any;
      timestamp: number;
      retryCount: number;
    }>
  >([]);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setIsOfflineMode(false);
      // Try to sync queue when coming back online
      if (queue.length > 0) {
        syncQueue();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setIsOfflineMode(true);
    };

    // Load queue from localStorage
    const savedQueue = localStorage.getItem('offlineQueue');
    if (savedQueue) {
      try {
        setQueue(JSON.parse(savedQueue));
      } catch (error) {
        console.error('Failed to load offline queue:', error);
      }
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    // Save queue to localStorage whenever it changes
    localStorage.setItem('offlineQueue', JSON.stringify(queue));
  }, [queue]);

  const addToQueue = (item: { url: string; method: string; data?: any }) => {
    const queueItem = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      url: item.url,
      method: item.method,
      data: item.data,
      timestamp: Date.now(),
      retryCount: 0,
    };

    setQueue(prev => [...prev, queueItem]);
  };

  const clearQueue = () => {
    setQueue([]);
    localStorage.removeItem('offlineQueue');
  };

  const syncQueue = async () => {
    if (!isOnline || queue.length === 0) return;

    const itemsToProcess = [...queue];
    const successfullyProcessed: string[] = [];

    for (const item of itemsToProcess) {
      try {
        const response = await fetch(item.url, {
          method: item.method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: item.data ? JSON.stringify(item.data) : undefined,
        });

        if (response.ok) {
          successfullyProcessed.push(item.id);
        } else {
          // Mark item with retry count
          item.retryCount += 1;
        }
      } catch (error) {
        console.error('Failed to sync queued item:', error);
        item.retryCount += 1;
      }
    }

    // Remove successfully processed items and retry old items
    setQueue(prev =>
      prev.filter(item => {
        if (successfullyProcessed.includes(item.id)) {
          return false;
        }
        // Remove items that have been retried too many times
        return item.retryCount < 3;
      })
    );
  };

  return (
    <OfflineContext.Provider
      value={{
        isOnline,
        isOfflineMode,
        queue,
        addToQueue,
        clearQueue,
        syncQueue,
      }}
    >
      {children}
    </OfflineContext.Provider>
  );
};

// Offline Banner Component
export const OfflineBanner: React.FC<{
  className?: string;
}> = ({ className = '' }) => {
  const { isOnline, isOfflineMode, queue, syncQueue } = useOffline();

  if (isOnline && !isOfflineMode && queue.length === 0) {
    return null;
  }

  return (
    <div
      className={`
      fixed top-0 left-0 right-0 z-50 bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800
      ${className}
    `}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div
                className={`w-2 h-2 rounded-full ${isOnline ? 'bg-yellow-500' : 'bg-red-500'} ${isOnline ? 'animate-pulse' : ''}`}
              ></div>
              <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                {isOnline ? 'Online - Syncing queued changes' : 'You are offline'}
              </span>
            </div>
            {queue.length > 0 && (
              <span className="text-xs text-yellow-600 dark:text-yellow-400">
                {queue.length} item{queue.length !== 1 ? 's' : ''} queued
              </span>
            )}
          </div>
          {isOnline && queue.length > 0 && (
            <button
              onClick={syncQueue}
              className="text-sm font-medium text-yellow-800 dark:text-yellow-200 hover:text-yellow-900 dark:hover:text-yellow-100"
            >
              Sync Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Offline Form Component
export const OfflineForm: React.FC<{
  onSubmit: (data: any) => Promise<void>;
  children: React.ReactNode;
  className?: string;
}> = ({ onSubmit, children, className = '' }) => {
  const { isOnline, addToQueue } = useOffline();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);

    if (isOnline) {
      try {
        await onSubmit(data);
      } catch (error) {
        console.error('Form submission failed:', error);
        // Queue the form data if submission fails
        addToQueue({
          url: '/api/forms',
          method: 'POST',
          data,
        });
      }
    } else {
      // Queue the form data when offline
      addToQueue({
        url: '/api/forms',
        method: 'POST',
        data,
      });
    }

    setIsSubmitting(false);
  };

  return (
    <form
      className={className}
      onSubmit={e => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());
        handleSubmit(data);
      }}
    >
      {children}
    </form>
  );
};

// Cache Manager Component
export class CacheManager {
  private static instance: CacheManager;
  private cache: Map<string, any> = new Map();
  private cacheExpiry: Map<string, number> = new Map();

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  set(key: string, value: any, ttl: number = 3600000) {
    // Default 1 hour
    this.cache.set(key, value);
    this.cacheExpiry.set(key, Date.now() + ttl);
  }

  get(key: string): any | null {
    const expiry = this.cacheExpiry.get(key);
    if (expiry && Date.now() > expiry) {
      this.delete(key);
      return null;
    }
    return this.cache.get(key) || null;
  }

  delete(key: string) {
    this.cache.delete(key);
    this.cacheExpiry.delete(key);
  }

  clear() {
    this.cache.clear();
    this.cacheExpiry.clear();
  }

  // Cache API responses
  async cacheResponse(
    key: string,
    fetchFn: () => Promise<any>,
    ttl: number = 3600000
  ): Promise<any> {
    const cached = this.get(key);
    if (cached !== null) {
      return cached;
    }

    try {
      const response = await fetchFn();
      this.set(key, response, ttl);
      return response;
    } catch (error) {
      // Return cached data if available when offline
      const fallbackData = this.get(key);
      if (fallbackData !== null) {
        console.warn('Using cached data due to offline status:', error);
        return fallbackData;
      }
      throw error;
    }
  }
}

// Progressive Web App Service Worker Registration
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
};

// Offline Data Sync Hook
export const useOfflineSync = () => {
  const { isOnline, queue, syncQueue } = useOffline();

  useEffect(() => {
    if (isOnline && queue.length > 0) {
      // Try to sync queue every 30 seconds when online
      const interval = setInterval(() => {
        syncQueue();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [isOnline, queue.length, syncQueue]);

  return { isOnline, queueLength: queue.length, syncQueue };
};

// Offline Status Indicator
export const OfflineStatus: React.FC<{
  className?: string;
  showQueueCount?: boolean;
}> = ({ className = '', showQueueCount = true }) => {
  const { isOnline, queue } = useOffline();

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div
        className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'} ${isOnline ? 'animate-pulse' : ''}`}
      ></div>
      <span
        className={`text-sm ${isOnline ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
      >
        {isOnline ? 'Online' : 'Offline'}
      </span>
      {showQueueCount && queue.length > 0 && (
        <span className="text-xs text-gray-500 dark:text-gray-400">({queue.length} queued)</span>
      )}
    </div>
  );
};
