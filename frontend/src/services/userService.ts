import apiClient from './apiClient';
import { UserRole } from '../types/index';

interface GetUsersParams {
  page?: number;
  pageSize?: number;
  search?: string;
  role?: UserRole;
  isActive?: boolean;
}

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  userName: string;
  role: UserRole;
  avatarUrl?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

interface UsersResponse {
  users: User[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
}

export const userService = {
  // Get all users
  async getUsers(params: GetUsersParams = {}): Promise<UsersResponse> {
    const response = await apiClient.get('/users', { params });
    return response.data;
  },

  // Get user by ID
  async getUser(userId: number): Promise<User> {
    const response = await apiClient.get(`/users/${userId}`);
    return response.data;
  },

  // Get users by role
  async getUsersByRole(role: UserRole, params: Omit<GetUsersParams, 'role'> = {}): Promise<UsersResponse> {
    const response = await apiClient.get('/users', {
      params: {
        ...params,
        role,
        pageSize: 100 // Get more users for dropdown selections
      }
    });
    return response.data;
  },

  // Get Product Owners
  async getProductOwners(params: Omit<GetUsersParams, 'role'> = {}): Promise<User[]> {
    const response = await this.getUsersByRole(UserRole.ProductOwner, params);
    return response.users;
  },

  // Get Scrum Masters
  async getScrumMasters(params: Omit<GetUsersParams, 'role'> = {}): Promise<User[]> {
    const response = await this.getUsersByRole(UserRole.ScrumMaster, params);
    return response.users;
  },

  // Get Developers
  async getDevelopers(params: Omit<GetUsersParams, 'role'> = {}): Promise<User[]> {
    const response = await this.getUsersByRole(UserRole.Developer, params);
    return response.users;
  },

  // Search users
  async searchUsers(query: string, params: Omit<GetUsersParams, 'search'> = {}): Promise<UsersResponse> {
    const response = await apiClient.get('/users', {
      params: {
        ...params,
        search: query,
        pageSize: 20
      }
    });
    return response.data;
  },
};