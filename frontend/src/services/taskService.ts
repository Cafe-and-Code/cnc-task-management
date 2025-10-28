import apiClient from './apiClient';
import { TaskStatus, TaskPriority, PaginatedResponse } from '../types/index';

interface Task {
  id: number;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  estimatedHours: number;
  actualHours: number;
  remainingHours: number;
  dueDate?: string;
  isActive: boolean;
  userStoryId: number;
  createdByUser?: {
    id: number;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
  assignedToUser?: {
    id: number;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface GetTasksParams {
  page?: number;
  pageSize?: number;
  userStoryId?: number;
  status?: TaskStatus;
  priority?: TaskPriority;
  search?: string;
}

interface CreateTaskData {
  title: string;
  description?: string;
  userStoryId: number;
  assignedToUserId?: number;
  status: TaskStatus;
  priority: TaskPriority;
  estimatedHours: number;
  dueDate?: string;
}

interface UpdateTaskData {
  title?: string;
  description?: string;
  assignedToUserId?: number;
  status?: TaskStatus;
  priority?: TaskPriority;
  estimatedHours?: number;
  actualHours?: number;
  remainingHours?: number;
  dueDate?: string;
}

export const taskService = {
  // Get all tasks
  async getTasks(params: GetTasksParams = {}): Promise<PaginatedResponse<Task>> {
    const response = await apiClient.get('/Tasks', { params });
    return response.data;
  },

  // Get task by ID
  async getTask(taskId: number): Promise<Task> {
    const response = await apiClient.get(`/Tasks/${taskId}`);
    return response.data;
  },

  // Create new task
  async createTask(taskData: CreateTaskData): Promise<Task> {
    const response = await apiClient.post('/Tasks', taskData);
    return response.data;
  },

  // Update task
  async updateTask(taskId: number, taskData: UpdateTaskData): Promise<{ message: string }> {
    const response = await apiClient.put(`/Tasks/${taskId}`, taskData);
    return response.data;
  },

  // Delete task
  async deleteTask(taskId: number): Promise<{ message: string }> {
    const response = await apiClient.delete(`/Tasks/${taskId}`);
    return response.data;
  },

  // Update task status
  async updateTaskStatus(taskId: number, status: TaskStatus): Promise<{ message: string }> {
    const response = await apiClient.put(`/Tasks/${taskId}/status`, { status });
    return response.data;
  },

  // Update task hours
  async updateTaskHours(taskId: number, hoursData: {
    estimatedHours?: number;
    actualHours?: number;
    remainingHours?: number;
  }): Promise<{ message: string }> {
    const response = await apiClient.put(`/Tasks/${taskId}/hours`, hoursData);
    return response.data;
  },

  // Get tasks for user story
  async getUserStoryTasks(userStoryId: number, params: Omit<GetTasksParams, 'userStoryId'> = {}): Promise<PaginatedResponse<Task>> {
    const response = await apiClient.get('/Tasks', {
      params: { userStoryId, ...params }
    });
    return response.data;
  },

  // Get available team members for task assignment
  async getAvailableTeamMembers(projectId: number): Promise<Array<{
    id: number;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
    role: string;
  }>> {
    const response = await apiClient.get(`/Projects/${projectId}/team`);
    return response.data;
  },

  // Get available user stories for task assignment
  async getAvailableUserStories(projectId: number): Promise<Array<{
    id: number;
    title: string;
    status: string;
    storyPoints: number;
  }>> {
    const response = await apiClient.get('/UserStories', {
      params: { projectId }
    });
    return response.data.userStories;
  }
};