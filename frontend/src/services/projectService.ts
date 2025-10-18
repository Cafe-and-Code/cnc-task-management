import apiClient from './apiClient';
import { Project, PaginatedResponse, ProjectStatus } from '../types/index';

interface GetProjectsParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: ProjectStatus;
}

interface CreateProjectData {
  name: string;
  description?: string;
  productOwnerId?: number;
  scrumMasterId?: number;
  status?: ProjectStatus;
  startDate?: string;
  endDate?: string;
  velocityGoal?: number;
  sprintDuration?: number;
}

export const projectService = {
  // Get all projects
  async getProjects(params: GetProjectsParams = {}): Promise<{
    projects: Project[];
    pagination: {
      page: number;
      pageSize: number;
      totalCount: number;
      totalPages: number;
    };
  }> {
    const response = await apiClient.get('/projects', { params });
    return response.data;
  },

  // Get project by ID
  async getProject(projectId: number): Promise<Project> {
    const response = await apiClient.get(`/projects/${projectId}`);
    return response.data;
  },

  // Create new project
  async createProject(projectData: CreateProjectData): Promise<Project> {
    const response = await apiClient.post('/projects', projectData);
    return response.data;
  },

  // Update project
  async updateProject(
    projectId: number,
    projectData: Partial<CreateProjectData>
  ): Promise<Project> {
    const response = await apiClient.put(`/projects/${projectId}`, projectData);
    return response.data;
  },

  // Delete project (soft delete)
  async deleteProject(projectId: number): Promise<{ message: string }> {
    const response = await apiClient.delete(`/projects/${projectId}`);
    return response.data;
  },

  // Archive project
  async archiveProject(projectId: number): Promise<{ message: string }> {
    const response = await apiClient.post(`/projects/${projectId}/archive`);
    return response.data;
  },

  // Get project analytics
  async getProjectAnalytics(projectId: number): Promise<{
    totalSprints: number;
    averageVelocity: number;
    totalStories: number;
    completedStories: number;
    totalTasks: number;
    completedTasks: number;
    teamSize: number;
  }> {
    const response = await apiClient.get(`/projects/${projectId}/analytics`);
    return response.data;
  },
};