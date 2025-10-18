import apiClient from './apiClient';
import { Team, TeamMember, PaginatedResponse, TeamRole, User } from '../types/index';

interface GetTeamsParams {
  page?: number;
  pageSize?: number;
  projectId?: number;
  search?: string;
}

interface CreateTeamData {
  name: string;
  description?: string;
  projectId: number;
}

interface UpdateTeamData {
  name?: string;
  description?: string;
  isActive?: boolean;
}

interface AddTeamMemberData {
  teamId: number;
  userId: number;
  role: TeamRole;
}

interface UpdateTeamMemberData {
  role?: TeamRole;
  isActive?: boolean;
}

export const teamService = {
  // Get all teams
  async getTeams(params: GetTeamsParams = {}): Promise<PaginatedResponse<Team>> {
    const response = await apiClient.get('/teams', { params });
    return response.data;
  },

  // Get team by ID
  async getTeam(teamId: number): Promise<Team> {
    const response = await apiClient.get(`/teams/${teamId}`);
    return response.data;
  },

  // Create new team
  async createTeam(teamData: CreateTeamData): Promise<Team> {
    const response = await apiClient.post('/teams', teamData);
    return response.data;
  },

  // Update team
  async updateTeam(
    teamId: number,
    teamData: UpdateTeamData
  ): Promise<Team> {
    const response = await apiClient.put(`/teams/${teamId}`, teamData);
    return response.data;
  },

  // Delete team
  async deleteTeam(teamId: number): Promise<{ message: string }> {
    const response = await apiClient.delete(`/teams/${teamId}`);
    return response.data;
  },

  // Get teams for project
  async getProjectTeams(projectId: number, params: Omit<GetTeamsParams, 'projectId'> = {}): Promise<PaginatedResponse<Team>> {
    const response = await apiClient.get(`/projects/${projectId}/teams`, { params });
    return response.data;
  },

  // Get team members
  async getTeamMembers(teamId: number): Promise<TeamMember[]> {
    const response = await apiClient.get(`/teams/${teamId}/members`);
    return response.data;
  },

  // Add member to team
  async addMember(memberData: AddTeamMemberData): Promise<TeamMember> {
    const response = await apiClient.post('/team-members', memberData);
    return response.data;
  },

  // Update team member
  async updateMember(
    memberId: number,
    memberData: UpdateTeamMemberData
  ): Promise<TeamMember> {
    const response = await apiClient.put(`/team-members/${memberId}`, memberData);
    return response.data;
  },

  // Remove member from team
  async removeMember(memberId: number): Promise<{ message: string }> {
    const response = await apiClient.delete(`/team-members/${memberId}`);
    return response.data;
  },

  // Get available users for project (not already in teams)
  async getAvailableUsers(projectId: number): Promise<User[]> {
    const response = await apiClient.get(`/projects/${projectId}/available-users`);
    return response.data;
  },

  // Add member to project team
  async addProjectMember(projectId: number, userId: number, role: TeamRole): Promise<TeamMember> {
    const response = await apiClient.post(`/projects/${projectId}/members`, { userId, role });
    return response.data;
  },

  // Get project team members
  async getProjectMembers(projectId: number): Promise<TeamMember[]> {
    const response = await apiClient.get(`/projects/${projectId}/members`);
    return response.data;
  },

  // Remove member from project
  async removeProjectMember(projectId: number, userId: number): Promise<{ message: string }> {
    const response = await apiClient.delete(`/projects/${projectId}/members/${userId}`);
    return response.data;
  },

  // Update project member role
  async updateProjectMemberRole(projectId: number, userId: number, role: TeamRole): Promise<TeamMember> {
    const response = await apiClient.patch(`/projects/${projectId}/members/${userId}`, { role });
    return response.data;
  },
};