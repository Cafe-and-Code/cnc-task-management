import apiClient from './apiClient';
import { UserStory, PaginatedResponse, UserStoryPriority, UserStoryStatus } from '../types/index';

interface GetUserStoriesParams {
  page?: number;
  pageSize?: number;
  projectId?: number;
  sprintId?: number;
  assigneeId?: number;
  status?: UserStoryStatus;
  priority?: UserStoryPriority;
  search?: string;
}

interface CreateUserStoryData {
  title: string;
  description?: string;
  acceptanceCriteria?: string;
  storyPoints: number;
  priority: UserStoryPriority;
  businessValue: number;
  estimatedHours?: number;
  assigneeId?: number;
  projectId: number;
}

interface UpdateUserStoryData {
  title?: string;
  description?: string;
  acceptanceCriteria?: string;
  storyPoints?: number;
  priority?: UserStoryPriority;
  status?: UserStoryStatus;
  businessValue?: number;
  estimatedHours?: number;
  assigneeId?: number;
}

export const userStoryService = {
  // Get all user stories
  async getUserStories(params: GetUserStoriesParams = {}): Promise<PaginatedResponse<UserStory>> {
    const response = await apiClient.get('/user-stories', { params });
    return response.data;
  },

  // Get user story by ID
  async getUserStory(storyId: number): Promise<UserStory> {
    const response = await apiClient.get(`/user-stories/${storyId}`);
    return response.data;
  },

  // Create new user story
  async createUserStory(storyData: CreateUserStoryData): Promise<UserStory> {
    const response = await apiClient.post('/user-stories', storyData);
    return response.data;
  },

  // Update user story
  async updateUserStory(
    storyId: number,
    storyData: UpdateUserStoryData
  ): Promise<UserStory> {
    const response = await apiClient.put(`/user-stories/${storyId}`, storyData);
    return response.data;
  },

  // Delete user story
  async deleteUserStory(storyId: number): Promise<{ message: string }> {
    const response = await apiClient.delete(`/user-stories/${storyId}`);
    return response.data;
  },

  // Move user story to sprint
  async moveToSprint(storyId: number, sprintId: number): Promise<UserStory> {
    const response = await apiClient.post(`/user-stories/${storyId}/move-to-sprint`, { sprintId });
    return response.data;
  },

  // Move user story to backlog
  async moveToBacklog(storyId: number): Promise<UserStory> {
    const response = await apiClient.post(`/user-stories/${storyId}/move-to-backlog`);
    return response.data;
  },

  // Get user stories for project backlog
  async getProjectBacklog(projectId: number, params: Omit<GetUserStoriesParams, 'projectId'> = {}): Promise<PaginatedResponse<UserStory>> {
    const response = await apiClient.get(`/projects/${projectId}/backlog`, { params });
    return response.data;
  },

  // Get user stories for sprint
  async getSprintStories(sprintId: number, params: Omit<GetUserStoriesParams, 'sprintId'> = {}): Promise<PaginatedResponse<UserStory>> {
    const response = await apiClient.get(`/sprints/${sprintId}/stories`, { params });
    return response.data;
  },

  // Update story status
  async updateStatus(storyId: number, status: UserStoryStatus): Promise<UserStory> {
    const response = await apiClient.patch(`/user-stories/${storyId}/status`, { status });
    return response.data;
  },

  // Assign story to user
  async assignToUser(storyId: number, assigneeId: number): Promise<UserStory> {
    const response = await apiClient.patch(`/user-stories/${storyId}/assign`, { assigneeId });
    return response.data;
  },

  // Unassign story
  async unassign(storyId: number): Promise<UserStory> {
    const response = await apiClient.patch(`/user-stories/${storyId}/unassign`);
    return response.data;
  },
};