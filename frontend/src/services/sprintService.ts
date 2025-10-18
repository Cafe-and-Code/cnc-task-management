import apiClient from './apiClient';
import { Sprint, PaginatedResponse, SprintStatus, BurndownData } from '../types/index';

interface GetSprintsParams {
  page?: number;
  pageSize?: number;
  projectId?: number;
  status?: SprintStatus;
  search?: string;
}

interface CreateSprintData {
  name: string;
  goal?: string;
  startDate?: string;
  endDate?: string;
  capacity: number;
  projectId: number;
}

interface UpdateSprintData {
  name?: string;
  goal?: string;
  startDate?: string;
  endDate?: string;
  capacity?: number;
  status?: SprintStatus;
}

export const sprintService = {
  // Get all sprints
  async getSprints(params: GetSprintsParams = {}): Promise<PaginatedResponse<Sprint>> {
    const response = await apiClient.get('/sprints', { params });
    return response.data;
  },

  // Get sprint by ID
  async getSprint(sprintId: number): Promise<Sprint> {
    const response = await apiClient.get(`/sprints/${sprintId}`);
    return response.data;
  },

  // Create new sprint
  async createSprint(sprintData: CreateSprintData): Promise<Sprint> {
    const response = await apiClient.post('/sprints', sprintData);
    return response.data;
  },

  // Update sprint
  async updateSprint(
    sprintId: number,
    sprintData: UpdateSprintData
  ): Promise<Sprint> {
    const response = await apiClient.put(`/sprints/${sprintId}`, sprintData);
    return response.data;
  },

  // Delete sprint
  async deleteSprint(sprintId: number): Promise<{ message: string }> {
    const response = await apiClient.delete(`/sprints/${sprintId}`);
    return response.data;
  },

  // Get sprints for project
  async getProjectSprints(projectId: number, params: Omit<GetSprintsParams, 'projectId'> = {}): Promise<PaginatedResponse<Sprint>> {
    const response = await apiClient.get(`/projects/${projectId}/sprints`, { params });
    return response.data;
  },

  // Start sprint
  async startSprint(sprintId: number): Promise<Sprint> {
    const response = await apiClient.post(`/sprints/${sprintId}/start`);
    return response.data;
  },

  // Complete sprint
  async completeSprint(sprintId: number): Promise<Sprint> {
    const response = await apiClient.post(`/sprints/${sprintId}/complete`);
    return response.data;
  },

  // Cancel sprint
  async cancelSprint(sprintId: number, reason?: string): Promise<Sprint> {
    const response = await apiClient.post(`/sprints/${sprintId}/cancel`, { reason });
    return response.data;
  },

  // Get sprint burndown data
  async getBurndownData(sprintId: number): Promise<BurndownData[]> {
    const response = await apiClient.get(`/sprints/${sprintId}/burndown`);
    return response.data;
  },

  // Update sprint status
  async updateStatus(sprintId: number, status: SprintStatus): Promise<Sprint> {
    const response = await apiClient.patch(`/sprints/${sprintId}/status`, { status });
    return response.data;
  },

  // Get active sprint for project
  async getActiveSprint(projectId: number): Promise<Sprint | null> {
    const response = await apiClient.get(`/projects/${projectId}/active-sprint`);
    return response.data;
  },

  // Get sprint analytics
  async getSprintAnalytics(sprintId: number): Promise<{
    totalStories: number;
    completedStories: number;
    totalTasks: number;
    completedTasks: number;
    storyPointsCompleted: number;
    storyPointsTotal: number;
    velocity: number;
    burndownData: BurndownData[];
  }> {
    const response = await apiClient.get(`/sprints/${sprintId}/analytics`);
    return response.data;
  },
};