import apiClient from './apiClient';

// Types
export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'To Do' | 'In Progress' | 'Testing' | 'Done';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  hoursEstimated: number;
  hoursActual: number;
  projectId: string;
  projectName: string;
  userStoryId: string;
  userStoryTitle: string;
  sprintId?: string;
  sprintName?: string;
  assigneeId?: string;
  assigneeName?: string;
  reporterId: string;
  reporterName: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskRequest {
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  hoursEstimated: number;
  userStoryId: string;
  reporterId: string;
  assigneeId?: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: 'To Do' | 'In Progress' | 'Testing' | 'Done';
  priority?: 'Low' | 'Medium' | 'High' | 'Critical';
  hoursEstimated?: number;
  assigneeId?: string;
}

const taskService = {
  // Get all tasks for a project
  getTasks: async (projectId: string): Promise<Task[]> => {
    const response = await apiClient.get(`/projects/${projectId}/tasks`);
    return response.data;
  },

  // Get task by ID
  getTaskById: async (taskId: string): Promise<Task> => {
    const response = await apiClient.get(`/tasks/${taskId}`);
    return response.data;
  },

  // Get tasks for a user story
  getUserStoryTasks: async (userStoryId: string): Promise<Task[]> => {
    const response = await apiClient.get(`/user-stories/${userStoryId}/tasks`);
    return response.data;
  },

  // Get tasks for a sprint
  getSprintTasks: async (sprintId: string): Promise<Task[]> => {
    const response = await apiClient.get(`/sprints/${sprintId}/tasks`);
    return response.data;
  },

  // Get tasks assigned to a user
  getUserTasks: async (userId: string): Promise<Task[]> => {
    const response = await apiClient.get(`/users/${userId}/tasks`);
    return response.data;
  },

  // Create new task
  createTask: async (taskData: CreateTaskRequest): Promise<Task> => {
    const response = await apiClient.post('/tasks', taskData);
    return response.data;
  },

  // Update task
  updateTask: async (taskId: string, taskData: UpdateTaskRequest): Promise<Task> => {
    const response = await apiClient.put(`/tasks/${taskId}`, taskData);
    return response.data;
  },

  // Delete task
  deleteTask: async (taskId: string): Promise<void> => {
    await apiClient.delete(`/tasks/${taskId}`);
  },

  // Update task status
  updateTaskStatus: async (taskId: string, status: Task['status']): Promise<Task> => {
    const response = await apiClient.post(`/tasks/${taskId}/status`, { status });
    return response.data;
  },

  // Log hours to task
  logHours: async (taskId: string, hours: number): Promise<Task> => {
    const response = await apiClient.post(`/tasks/${taskId}/loghours`, { hours });
    return response.data;
  },

  // Get task activity
  getTaskActivity: async (taskId: string): Promise<any[]> => {
    const response = await apiClient.get(`/tasks/${taskId}/activity`);
    return response.data;
  },

  // Add comment to task
  addComment: async (taskId: string, comment: string): Promise<any> => {
    const response = await apiClient.post(`/tasks/${taskId}/comments`, { comment });
    return response.data;
  },

  // Get task comments
  getComments: async (taskId: string): Promise<any[]> => {
    const response = await apiClient.get(`/tasks/${taskId}/comments`);
    return response.data;
  },

  // Add attachment to task
  addAttachment: async (taskId: string, file: File): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post(`/tasks/${taskId}/attachments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get task attachments
  getAttachments: async (taskId: string): Promise<any[]> => {
    const response = await apiClient.get(`/tasks/${taskId}/attachments`);
    return response.data;
  },

  // Download attachment
  downloadAttachment: async (taskId: string, attachmentId: string): Promise<Blob> => {
    const response = await apiClient.get(`/tasks/${taskId}/attachments/${attachmentId}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Delete attachment
  deleteAttachment: async (taskId: string, attachmentId: string): Promise<void> => {
    await apiClient.delete(`/tasks/${taskId}/attachments/${attachmentId}`);
  },
};

export default taskService;