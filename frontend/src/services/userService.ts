import apiClient from './apiClient';
import { UserRole } from '../types/index';

interface GetUsersParams {
  page?: number;
  pageSize?: number;
  search?: string;
  role?: UserRole;
  isActive?: boolean;
  includeCurrentUser?: boolean;
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
  phone?: string;
  location?: string;
  department?: string;
  organization?: string;
  team?: string;
  projectsCount?: number;
  tasksAssigned?: number;
  tasksCompleted?: number;
  loginCount?: number;
  storageUsed?: number;
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

interface UserStats {
  total: number;
  active: number;
  inactive: number;
  admins: number;
  productOwners: number;
  scrumMasters: number;
  developers: number;
  stakeholders: number;
  newThisMonth: number;
  onlineNow: number;
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
  /**
   * Get users eligible for Product Owner role
   * Note: In the frontend, these users are filtered to include both ProductOwner and Admin roles
   * @param params - Optional parameters for filtering
   * @returns Promise resolving to array of Product Owner users
   */
  async getProductOwners(params: Omit<GetUsersParams, 'role'> = {}): Promise<User[]> {
    const response = await apiClient.get('/users', {
      params: {
        ...params,
        role: UserRole.ProductOwner,
        pageSize: 100,
        includeCurrentUser: true // Include current user for role selection
      }
    });
    return response.data.users;
  },

  // Get Scrum Masters
  /**
   * Get users eligible for Scrum Master role
   * Note: In the frontend, these users are filtered to include both ScrumMaster and Admin roles
   * @param params - Optional parameters for filtering
   * @returns Promise resolving to array of Scrum Master users
   */
  async getScrumMasters(params: Omit<GetUsersParams, 'role'> = {}): Promise<User[]> {
    const response = await apiClient.get('/users', {
      params: {
        ...params,
        role: UserRole.ScrumMaster,
        pageSize: 100,
        includeCurrentUser: true // Include current user for role selection
      }
    });
    return response.data.users;
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

  // Get user statistics (admin only)
  async getUserStats(): Promise<UserStats> {
    // Get all users for statistics
    const allUsersResponse = await this.getUsers({ pageSize: 10000 });
    const users = allUsersResponse.users;

    // Calculate statistics
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const stats: UserStats = {
      total: users.length,
      active: users.filter(u => u.isActive).length,
      inactive: users.filter(u => !u.isActive).length,
      admins: users.filter(u => u.role === UserRole.Admin).length,
      productOwners: users.filter(u => u.role === UserRole.ProductOwner).length,
      scrumMasters: users.filter(u => u.role === UserRole.ScrumMaster).length,
      developers: users.filter(u => u.role === UserRole.Developer).length,
      stakeholders: users.filter(u => u.role === UserRole.Stakeholder).length,
      newThisMonth: users.filter(u => new Date(u.createdAt) >= currentMonthStart).length,
      onlineNow: 0, // This would require real-time tracking implementation
    };

    return stats;
  },

  // Update user role (admin only)
  async updateUserRole(userId: number, newRole: UserRole): Promise<void> {
    const response = await apiClient.put(`/users/${userId}/role`, { role: newRole });
    return response.data;
  },

  // Activate user (admin only)
  async activateUser(userId: number): Promise<void> {
    const response = await apiClient.put(`/users/${userId}/activate`);
    return response.data;
  },

  // Deactivate user (admin only)
  async deactivateUser(userId: number): Promise<void> {
    const response = await apiClient.put(`/users/${userId}/deactivate`);
    return response.data;
  },

  // Reset user password (admin only)
  async resetUserPassword(userId: number, newPassword: string): Promise<void> {
    const response = await apiClient.post(`/users/${userId}/reset-password`, {
      newPassword
    });
    return response.data;
  },
};