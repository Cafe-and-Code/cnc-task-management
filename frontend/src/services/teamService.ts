import apiClient from './apiClient';

// Types
export interface Team {
  id: string;
  name: string;
  description: string;
  projectId: string;
  projectName: string;
  members: TeamMember[];
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  teamId: string;
  teamName: string;
  role: 'Owner' | 'Admin' | 'Member';
  joinedAt: string;
}

export interface CreateTeamRequest {
  name: string;
  description: string;
  projectId: string;
}

export interface UpdateTeamRequest {
  name?: string;
  description?: string;
}

const teamService = {
  // Get all teams for a project
  getTeams: async (projectId: string): Promise<Team[]> => {
    const response = await apiClient.get(`/projects/${projectId}/teams`);
    return response.data;
  },

  // Get team by ID
  getTeamById: async (teamId: string): Promise<Team> => {
    const response = await apiClient.get(`/teams/${teamId}`);
    return response.data;
  },

  // Get teams for a user
  getUserTeams: async (userId: string): Promise<Team[]> => {
    const response = await apiClient.get(`/users/${userId}/teams`);
    return response.data;
  },

  // Get team members
  getTeamMembers: async (teamId: string): Promise<TeamMember[]> => {
    const response = await apiClient.get(`/teams/${teamId}/members`);
    return response.data;
  },

  // Create new team
  createTeam: async (teamData: CreateTeamRequest): Promise<Team> => {
    const response = await apiClient.post('/teams', teamData);
    return response.data;
  },

  // Update team
  updateTeam: async (teamId: string, teamData: UpdateTeamRequest): Promise<Team> => {
    const response = await apiClient.put(`/teams/${teamId}`, teamData);
    return response.data;
  },

  // Delete team
  deleteTeam: async (teamId: string): Promise<void> => {
    await apiClient.delete(`/teams/${teamId}`);
  },

  // Add member to team
  addTeamMember: async (teamId: string, userId: string, role: TeamMember['role']): Promise<TeamMember> => {
    const response = await apiClient.post(`/teams/${teamId}/members`, { userId, role });
    return response.data;
  },

  // Update team member role
  updateTeamMemberRole: async (teamId: string, userId: string, role: TeamMember['role']): Promise<TeamMember> => {
    const response = await apiClient.put(`/teams/${teamId}/members/${userId}`, { role });
    return response.data;
  },

  // Remove member from team
  removeTeamMember: async (teamId: string, userId: string): Promise<void> => {
    await apiClient.delete(`/teams/${teamId}/members/${userId}`);
  },

  // Get team activity
  getTeamActivity: async (teamId: string): Promise<any[]> => {
    const response = await apiClient.get(`/teams/${teamId}/activity`);
    return response.data;
  },
};

export default teamService;