import { apiClient } from './apiClient';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  role: string;
  organizationId: string;
  organizationName?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  role: string;
  organizationId: string;
  password: string;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  role?: string;
  isActive?: boolean;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export const userService = {
  // Get all users
  async getUsers(organizationId?: string): Promise<User[]> {
    const params = organizationId ? { organizationId } : {};
    const response = await apiClient.get('/users', { params });
    return response.data;
  },

  // Get user by ID
  async getUserById(id: string): Promise<User> {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },

  // Create a new user
  async createUser(userData: CreateUserRequest): Promise<User> {
    const response = await apiClient.post('/users', userData);
    return response.data;
  },

  // Update user
  async updateUser(id: string, userData: UpdateUserRequest): Promise<User> {
    const response = await apiClient.put(`/users/${id}`, userData);
    return response.data;
  },

  // Delete user
  async deleteUser(id: string): Promise<void> {
    await apiClient.delete(`/users/${id}`);
  },

  // Change password
  async changePassword(passwordData: ChangePasswordRequest): Promise<void> {
    await apiClient.post('/auth/change-password', passwordData);
  },

  // Get current user profile
  async getCurrentUserProfile(): Promise<User> {
    const response = await apiClient.get('/auth/profile');
    return response.data;
  },

  // Update current user profile
  async updateCurrentUserProfile(userData: UpdateUserRequest): Promise<User> {
    const response = await apiClient.put('/auth/profile', userData);
    return response.data;
  },

  // Reset password
  async resetPassword(email: string): Promise<void> {
    await apiClient.post('/auth/reset-password', { email });
  },

  // Confirm password reset
  async confirmPasswordReset(token: string, newPassword: string): Promise<void> {
    await apiClient.post('/auth/confirm-password-reset', { token, newPassword });
  },
};