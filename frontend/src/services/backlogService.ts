import apiClient from './apiClient';
import { UserStory, PaginatedResponse, UserStoryPriority } from '../types/index';

interface GetBacklogParams {
  page?: number;
  pageSize?: number;
  search?: string;
  priority?: UserStoryPriority;
  assigneeFilter?: string;
  sortBy?: 'priority' | 'storyPoints' | 'created' | 'updated' | 'title';
  sortOrder?: 'asc' | 'desc';
}

interface BulkUpdateBacklogData {
  projectId: number;
  userStoryIds: number[];
  priority?: UserStoryPriority;
  storyPoints?: number;
  assignedToUserId?: number;
}

interface AssignToSprintData {
  sprintId: number;
  userStoryIds: number[];
}

export const backlogService = {
  // Get all backlog items for a project
  async getBacklogItems(projectId: number, params: GetBacklogParams = {}): Promise<PaginatedResponse<UserStory>> {
    const response = await apiClient.get('/Backlog', {
      params: {
        projectId,
        ...params
      }
    });
    return response.data;
  },

  // Get backlog statistics
  async getBacklogStats(projectId: number): Promise<{
    totalStories: number;
    totalStoryPoints: number;
    totalBusinessValue: number;
    priorityBreakdown: Record<string, number>;
    unassignedStories: number;
    storiesWithTasks: number;
    totalEstimatedHours: number;
    averageStoryPoints: number;
  }> {
    const response = await apiClient.get('/Backlog/stats', {
      params: { projectId }
    });
    return response.data;
  },

  // Bulk update backlog items
  async bulkUpdateBacklogItems(data: BulkUpdateBacklogData): Promise<{ message: string }> {
    const response = await apiClient.put('/Backlog/bulk', data);
    return response.data;
  },

  // Assign multiple stories to a sprint
  async assignStoriesToSprint(data: AssignToSprintData): Promise<{ message: string }> {
    const response = await apiClient.post('/Backlog/assign-to-sprint', data);
    return response.data;
  },

  // Create new user story in backlog
  async createBacklogItem(projectId: number, storyData: {
    title: string;
    description?: string;
    acceptanceCriteria?: string[];
    storyPoints: number;
    priority: UserStoryPriority;
    businessValue: number;
    assigneeId?: number;
  }): Promise<UserStory> {
    const response = await apiClient.post('/UserStories', {
      ...storyData,
      projectId,
      status: 'Backlog'
    });
    return response.data;
  },

  // Update user story
  async updateBacklogItem(storyId: number, storyData: {
    title?: string;
    description?: string;
    acceptanceCriteria?: string[];
    storyPoints?: number;
    priority?: UserStoryPriority;
    businessValue?: number;
    assigneeId?: number;
  }): Promise<UserStory> {
    const response = await apiClient.put(`/UserStories/${storyId}`, storyData);
    return response.data;
  },

  // Delete user story from backlog
  async deleteBacklogItem(storyId: number): Promise<{ message: string }> {
    const response = await apiClient.delete(`/UserStories/${storyId}`);
    return response.data;
  },

  // Get unassigned users for assignment
  async getUnassignedUsers(projectId: number): Promise<Array<{
    id: number;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  }>> {
    // This would typically call a users endpoint, but for now we'll use the projects endpoint
    const response = await apiClient.get(`/Projects/${projectId}/team`);
    return response.data;
  }
};