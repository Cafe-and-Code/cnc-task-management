import apiClient from './apiClient';

export interface ActivityItem {
  id: string;
  type: 'project' | 'task' | 'sprint' | 'user' | 'team';
  action: string;
  entity: string;
  description: string;
  user: {
    id: number;
    name: string;
    avatar?: string;
  };
  timestamp: number;
  link?: string;
}

interface GetActivitiesParams {
  page?: number;
  pageSize?: number;
  type?: ActivityItem['type'];
  userId?: number;
  projectId?: number;
  limit?: number;
}

interface ActivitiesResponse {
  activities: ActivityItem[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
}

export const activityService = {
  // Get recent activities
  async getRecentActivities(params: GetActivitiesParams = {}): Promise<ActivitiesResponse> {
    const response = await apiClient.get('/activities', {
      params: {
        page: params.page || 1,
        pageSize: params.pageSize || 20,
        limit: params.limit || 10,
        type: params.type,
        userId: params.userId,
        projectId: params.projectId,
        sort: 'timestamp',
        order: 'desc'
      }
    });
    return response.data;
  },

  // Get activities for a specific project
  async getProjectActivities(projectId: number, params: Omit<GetActivitiesParams, 'projectId'> = {}): Promise<ActivitiesResponse> {
    const response = await apiClient.get(`/projects/${projectId}/activities`, {
      params: {
        page: params.page || 1,
        pageSize: params.pageSize || 20,
        type: params.type,
        userId: params.userId,
        sort: 'timestamp',
        order: 'desc'
      }
    });
    return response.data;
  },

  // Get activities for a specific user
  async getUserActivities(userId: number, params: Omit<GetActivitiesParams, 'userId'> = {}): Promise<ActivitiesResponse> {
    const response = await apiClient.get(`/users/${userId}/activities`, {
      params: {
        page: params.page || 1,
        pageSize: params.pageSize || 20,
        type: params.type,
        projectId: params.projectId,
        sort: 'timestamp',
        order: 'desc'
      }
    });
    return response.data;
  },

  // Log a new activity (this would typically be called by backend services)
  async logActivity(activity: Omit<ActivityItem, 'id' | 'timestamp'>): Promise<ActivityItem> {
    const response = await apiClient.post('/activities', activity);
    return response.data;
  },

  // Get activity statistics
  async getActivityStats(params: {
    userId?: number;
    projectId?: number;
    timeframe?: 'today' | 'week' | 'month' | 'year';
  } = {}): Promise<{
    totalActivities: number;
    activitiesByType: Record<string, number>;
    activitiesByAction: Record<string, number>;
    recentTrend: number; // percentage change from previous period
  }> {
    const response = await apiClient.get('/activities/stats', { params });
    return response.data;
  },
};