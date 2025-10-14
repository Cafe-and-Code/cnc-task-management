import apiClient from './apiClient';

export interface UserStory {
  id: string;
  title: string;
  description: string;
  projectId: string;
  projectName?: string;
  sprintId?: string;
  sprintName?: string;
  status: 'Backlog' | 'Ready' | 'In Progress' | 'Testing' | 'Done';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  storyPoints?: number;
  acceptanceCriteria: string[];
  assignedToId?: string;
  assignedToName?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  taskCount?: number;
  completedTaskCount?: number;
}

export interface CreateUserStoryRequest {
  title: string;
  description: string;
  projectId: string;
  sprintId?: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  storyPoints?: number;
  acceptanceCriteria: string[];
  assignedToId?: string;
}

export interface UpdateUserStoryRequest {
  title?: string;
  description?: string;
  sprintId?: string;
  status?: 'Backlog' | 'Ready' | 'In Progress' | 'Testing' | 'Done';
  priority?: 'Low' | 'Medium' | 'High' | 'Critical';
  storyPoints?: number;
  acceptanceCriteria?: string[];
  assignedToId?: string;
}

export const userStoryService = {
  // Get all user stories
  async getUserStories(projectId?: string, sprintId?: string): Promise<UserStory[]> {
    const params: any = {};
    if (projectId) params.projectId = projectId;
    if (sprintId) params.sprintId = sprintId;
    
    const response = await apiClient.get('/user-stories', { params });
    return response.data;
  },

  // Get user story by ID
  async getUserStoryById(id: string): Promise<UserStory> {
    const response = await apiClient.get(`/user-stories/${id}`);
    return response.data;
  },

  // Create a new user story
  async createUserStory(storyData: CreateUserStoryRequest): Promise<UserStory> {
    const response = await apiClient.post('/user-stories', storyData);
    return response.data;
  },

  // Update user story
  async updateUserStory(id: string, storyData: UpdateUserStoryRequest): Promise<UserStory> {
    const response = await apiClient.put(`/user-stories/${id}`, storyData);
    return response.data;
  },

  // Delete user story
  async deleteUserStory(id: string): Promise<void> {
    await apiClient.delete(`/user-stories/${id}`);
  },

  // Get user story tasks
  async getUserStoryTasks(id: string): Promise<any[]> {
    const response = await apiClient.get(`/user-stories/${id}/tasks`);
    return response.data;
  },

  // Add task to user story
  async addTaskToUserStory(userStoryId: string, taskData: any): Promise<any> {
    const response = await apiClient.post(`/user-stories/${userStoryId}/tasks`, taskData);
    return response.data;
  },

  // Move user story to sprint
  async moveToSprint(userStoryId: string, sprintId: string): Promise<UserStory> {
    const response = await apiClient.post(`/user-stories/${userStoryId}/move-to-sprint`, { sprintId });
    return response.data;
  },

  // Move user story to backlog
  async moveToBacklog(userStoryId: string): Promise<UserStory> {
    const response = await apiClient.post(`/user-stories/${userStoryId}/move-to-backlog`);
    return response.data;
  },

  // Assign user story to sprint
  async assignUserStoryToSprint(userStoryId: string, sprintId: string): Promise<UserStory> {
    const response = await apiClient.post(`/user-stories/${userStoryId}/assign-to-sprint`, { sprintId });
    return response.data;
  },

  // Move user story
  async moveUserStory(userStoryId: string, status: UserStory['status']): Promise<UserStory> {
    const response = await apiClient.put(`/user-stories/${userStoryId}/status`, { status });
    return response.data;
  },

  // Get backlog user stories
  async getBacklogUserStories(projectId: string): Promise<UserStory[]> {
    const response = await apiClient.get(`/projects/${projectId}/backlog`);
    return response.data;
  },
};

export default userStoryService;