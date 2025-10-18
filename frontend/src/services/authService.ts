import apiClient from './apiClient';
import { LoginCredentials, RegisterData, User, ApiResponse } from '@types/index';

interface LoginResponse {
  token: string;
  refreshToken: string;
  expiresIn: number;
  user: User;
}

interface RegisterResponse {
  message: string;
  userId: number;
  organizationId: number;
  organizationName?: string;
  emailVerificationToken?: string;
}

export const authService = {
  // Login user
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  // Register new user
  async register(userData: RegisterData): Promise<RegisterResponse> {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  },

  // Get current user profile
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get('/auth/profile');
    return response.data;
  },

  // Update user profile
  async updateProfile(profileData: {
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
  }): Promise<{ message: string }> {
    const response = await apiClient.put('/auth/profile', profileData);
    return response.data;
  },

  // Logout user
  async logout(): Promise<{ message: string }> {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },

  // Verify email
  async verifyEmail(userId: string, token: string): Promise<{ message: string }> {
    const response = await apiClient.post('/auth/verify-email', { userId, token });
    return response.data;
  },

  // Forgot password
  async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  },

  // Reset password
  async resetPassword(
    userId: string,
    token: string,
    newPassword: string
  ): Promise<{ message: string }> {
    const response = await apiClient.post('/auth/reset-password', {
      userId,
      token,
      newPassword,
    });
    return response.data;
  },

  // Change password
  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    const response = await apiClient.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },

  // Refresh token
  async refreshToken(refreshToken: string): Promise<{ token: string; expiresIn: number }> {
    const response = await apiClient.post('/auth/refresh', { refreshToken });
    return response.data;
  },

  // Check if token is expired
  isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch {
      return true; // If we can't parse the token, consider it expired
    }
  },

  // Get token expiry time
  getTokenExpiry(token: string): number | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp ? payload.exp * 1000 : null; // Convert to milliseconds
    } catch {
      return null;
    }
  },
};
