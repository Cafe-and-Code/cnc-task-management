import apiClient from '@services/apiClient';

interface DashboardData {
  metrics: {
    totalProjects: number;
    activeProjects: number;
    totalTasks: number;
    completedTasks: number;
    teamMembers: number;
    averageVelocity: number;
  };
  recentActivity: any[];
  upcomingDeadlines: any[];
  sprintProgress: any[];
  teamPerformance: any[];
  notifications: any[];
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class DashboardService {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private refreshIntervals: Map<string, NodeJS.Timeout> = new Map();

  // Cache management
  private setCache<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  private getCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  private clearCache(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  // API methods
  async fetchDashboardData(forceRefresh: boolean = false): Promise<DashboardData> {
    const cacheKey = 'dashboard-data';

    if (!forceRefresh) {
      const cachedData = this.getCache<DashboardData>(cacheKey);
      if (cachedData) {
        console.log('Returning cached dashboard data');
        return cachedData;
      }
    }

    try {
      console.log('Fetching fresh dashboard data');
      const response = await apiClient.get('/dashboard');
      const data = response.data;

      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      throw error;
    }
  }

  async fetchMetrics(forceRefresh: boolean = false) {
    const cacheKey = 'dashboard-metrics';

    if (!forceRefresh) {
      const cachedData = this.getCache(cacheKey);
      if (cachedData) return cachedData;
    }

    try {
      const response = await apiClient.get('/dashboard/metrics');
      this.setCache(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
      throw error;
    }
  }

  async fetchRecentActivity(forceRefresh: boolean = false) {
    const cacheKey = 'dashboard-activity';

    if (!forceRefresh) {
      const cachedData = this.getCache(cacheKey);
      if (cachedData) return cachedData;
    }

    try {
      const response = await apiClient.get('/dashboard/activity');
      this.setCache(cacheKey, response.data, 60 * 1000); // 1 minute cache
      return response.data;
    } catch (error) {
      console.error('Failed to fetch recent activity:', error);
      throw error;
    }
  }

  async fetchUpcomingDeadlines(forceRefresh: boolean = false) {
    const cacheKey = 'dashboard-deadlines';

    if (!forceRefresh) {
      const cachedData = this.getCache(cacheKey);
      if (cachedData) return cachedData;
    }

    try {
      const response = await apiClient.get('/dashboard/deadlines');
      this.setCache(cacheKey, response.data, 5 * 60 * 1000); // 5 minute cache
      return response.data;
    } catch (error) {
      console.error('Failed to fetch deadlines:', error);
      throw error;
    }
  }

  async fetchSprintProgress(forceRefresh: boolean = false) {
    const cacheKey = 'dashboard-sprint-progress';

    if (!forceRefresh) {
      const cachedData = this.getCache(cacheKey);
      if (cachedData) return cachedData;
    }

    try {
      const response = await apiClient.get('/dashboard/sprint-progress');
      this.setCache(cacheKey, response.data, 10 * 60 * 1000); // 10 minute cache
      return response.data;
    } catch (error) {
      console.error('Failed to fetch sprint progress:', error);
      throw error;
    }
  }

  async fetchTeamPerformance(forceRefresh: boolean = false) {
    const cacheKey = 'dashboard-team-performance';

    if (!forceRefresh) {
      const cachedData = this.getCache(cacheKey);
      if (cachedData) return cachedData;
    }

    try {
      const response = await apiClient.get('/dashboard/team-performance');
      this.setCache(cacheKey, response.data, 15 * 60 * 1000); // 15 minute cache
      return response.data;
    } catch (error) {
      console.error('Failed to fetch team performance:', error);
      throw error;
    }
  }

  async fetchNotifications(forceRefresh: boolean = false) {
    const cacheKey = 'dashboard-notifications';

    if (!forceRefresh) {
      const cachedData = this.getCache(cacheKey);
      if (cachedData) return cachedData;
    }

    try {
      const response = await apiClient.get('/dashboard/notifications');
      this.setCache(cacheKey, response.data, 30 * 1000); // 30 second cache
      return response.data;
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      throw error;
    }
  }

  // Auto-refresh functionality
  startAutoRefresh(callback: () => void, intervalMs: number = 30 * 1000): string {
    const intervalId = setInterval(callback, intervalMs);
    const id = `interval-${Date.now()}`;
    this.refreshIntervals.set(id, intervalId);
    return id;
  }

  stopAutoRefresh(intervalId: string): void {
    const interval = this.refreshIntervals.get(intervalId);
    if (interval) {
      clearInterval(interval);
      this.refreshIntervals.delete(intervalId);
    }
  }

  stopAllAutoRefresh(): void {
    this.refreshIntervals.forEach(interval => clearInterval(interval));
    this.refreshIntervals.clear();
  }

  // Data invalidation
  invalidateData(dataType?: string): void {
    if (dataType) {
      this.clearCache(`dashboard-${dataType}`);
    } else {
      this.clearCache();
    }
  }

  // Real-time data updates
  handleRealtimeUpdate(event: string, data: any): void {
    console.log(`Handling real-time update: ${event}`, data);

    // Invalidate relevant cache entries
    switch (event) {
      case 'task_updated':
        this.invalidateData('metrics');
        this.invalidateData('activity');
        this.invalidateData('sprint-progress');
        break;
      case 'project_updated':
        this.invalidateData('metrics');
        this.invalidateData('deadlines');
        this.invalidateData('team-performance');
        break;
      case 'sprint_updated':
        this.invalidateData('sprint-progress');
        this.invalidateData('metrics');
        break;
      case 'user_activity':
        this.invalidateData('activity');
        break;
      case 'notification':
        this.invalidateData('notifications');
        break;
      default:
        // Invalidate all cache for unknown events
        this.clearCache();
    }
  }

  // Background refresh helper
  async backgroundRefresh(): Promise<void> {
    try {
      // Fetch data in background without blocking UI
      const data = await this.fetchDashboardData();
      console.log('Background refresh completed');
    } catch (error) {
      console.error('Background refresh failed:', error);
    }
  }

  // Get cache status
  getCacheStatus(): { [key: string]: { age: number; ttl: number } } {
    const status: { [key: string]: { age: number; ttl: number } } = {};
    const now = Date.now();

    this.cache.forEach((entry, key) => {
      status[key] = {
        age: now - entry.timestamp,
        ttl: entry.ttl,
      };
    });

    return status;
  }
}

// Singleton instance
export const dashboardService = new DashboardService();
