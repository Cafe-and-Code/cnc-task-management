import apiClient from './apiClient';

export interface Sprint {
  id: string;
  name: string;
  description: string;
  projectId: string;
  projectName?: string;
  status: 'Planning' | 'Active' | 'Completed' | 'Cancelled';
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  taskCount?: number;
  completedTaskCount?: number;
}

export interface CreateSprintRequest {
  name: string;
  description: string;
  projectId: string;
  startDate: string;
  endDate: string;
}

export interface UpdateSprintRequest {
  name?: string;
  description?: string;
  status?: 'Planning' | 'Active' | 'Completed' | 'Cancelled';
  startDate?: string;
  endDate?: string;
}

const sprintService = {
  // Get all sprints
  async getSprints(projectId?: string): Promise<Sprint[]> {
    const params = projectId ? { projectId } : {};
    const response = await apiClient.get('/sprints', { params });
    return response.data;
  },

  // Get sprint by ID
  async getSprintById(id: string): Promise<Sprint> {
    const response = await apiClient.get(`/sprints/${id}`);
    return response.data;
  },

  // Create a new sprint
  async createSprint(sprintData: CreateSprintRequest): Promise<Sprint> {
    const response = await apiClient.post('/sprints', sprintData);
    return response.data;
  },

  // Update sprint
  async updateSprint(id: string, sprintData: UpdateSprintRequest): Promise<Sprint> {
    const response = await apiClient.put(`/sprints/${id}`, sprintData);
    return response.data;
  },

  // Delete sprint
  async deleteSprint(id: string): Promise<void> {
    await apiClient.delete(`/sprints/${id}`);
  },

  // Get sprint tasks
  async getSprintTasks(id: string): Promise<any[]> {
    const response = await apiClient.get(`/sprints/${id}/tasks`);
    return response.data;
  },

  // Add task to sprint
  async addTaskToSprint(sprintId: string, taskId: string): Promise<void> {
    await apiClient.post(`/sprints/${sprintId}/tasks`, { taskId });
  },

  // Remove task from sprint
  async removeTaskFromSprint(sprintId: string, taskId: string): Promise<void> {
    await apiClient.delete(`/sprints/${sprintId}/tasks/${taskId}`);
  },

  // Start sprint
  async startSprint(id: string): Promise<Sprint> {
    const response = await apiClient.post(`/sprints/${id}/start`);
    return response.data;
  },

  // Complete sprint
  async completeSprint(id: string): Promise<Sprint> {
    const response = await apiClient.post(`/sprints/${id}/complete`);
    return response.data;
  },

  // Get sprint burndown data
  async getSprintBurndown(id: string): Promise<any> {
    const response = await apiClient.get(`/sprints/${id}/burndown`);
    return response.data;
  },
};

export default sprintService;