import apiClient from './apiClient';

export interface Organization {
  id: string;
  name: string;
  description: string;
  domain?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  userCount?: number;
  projectCount?: number;
}

export interface CreateOrganizationRequest {
  name: string;
  description: string;
  domain?: string;
}

export interface UpdateOrganizationRequest {
  name?: string;
  description?: string;
  domain?: string;
  isActive?: boolean;
}

export const organizationService = {
  // Get all organizations
  async getOrganizations(): Promise<Organization[]> {
    const response = await apiClient.get('/organizations');
    return response.data;
  },

  // Get organization by ID
  async getOrganizationById(id: string): Promise<Organization> {
    const response = await apiClient.get(`/organizations/${id}`);
    return response.data;
  },

  // Create a new organization
  async createOrganization(orgData: CreateOrganizationRequest): Promise<Organization> {
    const response = await apiClient.post('/organizations', orgData);
    return response.data;
  },

  // Update organization
  async updateOrganization(id: string, orgData: UpdateOrganizationRequest): Promise<Organization> {
    const response = await apiClient.put(`/organizations/${id}`, orgData);
    return response.data;
  },

  // Delete organization
  async deleteOrganization(id: string): Promise<void> {
    await apiClient.delete(`/organizations/${id}`);
  },

  // Get organization users
  async getOrganizationUsers(id: string): Promise<any[]> {
    const response = await apiClient.get(`/organizations/${id}/users`);
    return response.data;
  },

  // Add user to organization
  async addUserToOrganization(organizationId: string, userId: string, role: string): Promise<void> {
    await apiClient.post(`/organizations/${organizationId}/users`, { userId, role });
  },

  // Remove user from organization
  async removeUserFromOrganization(organizationId: string, userId: string): Promise<void> {
    await apiClient.delete(`/organizations/${organizationId}/users/${userId}`);
  },

  // Get organization projects
  async getOrganizationProjects(id: string): Promise<any[]> {
    const response = await apiClient.get(`/organizations/${id}/projects`);
    return response.data;
  },

  // Get organization teams
  async getOrganizationTeams(id: string): Promise<any[]> {
    const response = await apiClient.get(`/organizations/${id}/teams`);
    return response.data;
  },
};