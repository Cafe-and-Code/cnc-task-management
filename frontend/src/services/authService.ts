import apiClient from './apiClient';
import { getCookie, setCookie, deleteCookie } from '@/utils/cookies';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  organizationName?: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  expiresIn?: number;
  user: {
    id: string;
    email: string;
    userName?: string;
    firstName: string;
    lastName: string;
    role: string;
    organizationId: string;
    avatarUrl?: string;
  };
}

export const authService = {
  // Login user
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  // Register new user
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  },

  // Logout user
  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
    deleteCookie('token');
    deleteCookie('refreshToken');
  },

  // Refresh token
  async refreshToken(): Promise<AuthResponse> {
    const response = await apiClient.post('/auth/refresh');
    return response.data;
  },

  // Get current user
  async getCurrentUser(): Promise<AuthResponse['user']> {
    const response = await apiClient.get('/auth/profile');
    return response.data;
  },

  // Store auth token
  setToken(token: string): void {
    setCookie('token', token, 7);
  },

  // Get auth token
  getToken(): string | null {
    return getCookie('token');
  },

  // Remove auth token
  removeToken(): void {
    deleteCookie('token');
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token;
  },
};

export default authService;