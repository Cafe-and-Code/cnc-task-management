import apiClient from './apiClient';

export interface Project {
  id: string;
  name: string;
  description: string;
  organizationId: string;
  organizationName?: string;
  status: 'Not Started' | 'In Progress' | 'On Hold' | 'Completed' | 'Cancelled';
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
  memberCount?: number;
  sprintCount?: number;
  userStoryCount?: number;
}

export interface CreateProjectRequest {
  name: string;
  description: string;
  organizationId: string;
  startDate?: string;
  endDate?: string;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  status?: 'Not Started' | 'In Progress' | 'On Hold' | 'Completed' | 'Cancelled';
  startDate?: string;
  endDate?: string;
}

export const projectService = {
  // Get projects with pagination
  async getProjects(page: number = 1, pageSize: number = 10, filter?: any): Promise<{ projects: Project[]; pagination: any }> {
    const params: any = { page, pageSize };
    if (filter) {
      if (filter.organizationId) {
        params.organizationId = filter.organizationId;
      }
      if (filter.search) {
        params.search = filter.search;
      }
      if (filter.status) {
        params.status = filter.status;
      }
    }
    const response = await apiClient.get('/projects', { params });
    return response.data;
  },

  // Get all projects (without pagination)
  async getAllProjects(organizationId?: string): Promise<Project[]> {
    const params = organizationId ? { organizationId } : {};
    const response = await apiClient.get('/projects/all', { params });
    return response.data;
  },

  // Get project by ID
  async getProjectById(id: string): Promise<Project> {
    const response = await apiClient.get(`/projects/${id}`);
    return response.data;
  },

  // Create a new project
  async createProject(projectData: CreateProjectRequest): Promise<Project> {
    const response = await apiClient.post('/projects', projectData);
    return response.data;
  },

  // Update project
  async updateProject(id: string, projectData: UpdateProjectRequest): Promise<Project> {
    const response = await apiClient.put(`/projects/${id}`, projectData);
    return response.data;
  },

  // Delete project
  async deleteProject(id: string): Promise<void> {
    await apiClient.delete(`/projects/${id}`);
  },

  // Get project members
  async getProjectMembers(id: string): Promise<any[]> {
    const response = await apiClient.get(`/projects/${id}/members`);
    return response.data;
  },

  // Add project member
  async addProjectMember(projectId: string, userId: string, role: string): Promise<void> {
    await apiClient.post(`/projects/${projectId}/members`, { userId, role });
  },

  // Remove project member
  async removeProjectMember(projectId: string, userId: string): Promise<void> {
    await apiClient.delete(`/projects/${projectId}/members/${userId}`);
  },

  // Get project sprints
  async getProjectSprints(id: string): Promise<any[]> {
    const response = await apiClient.get(`/projects/${id}/sprints`);
    return response.data;
  },

  // Get project user stories
  async getProjectUserStories(id: string): Promise<any[]> {
    const response = await apiClient.get(`/projects/${id}/user-stories`);
    return response.data;
  },
};

export default projectService;