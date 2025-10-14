import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import teamService from '@/services/teamService';

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

export interface TeamState {
  teams: Team[];
  currentTeam: Team | null;
  userTeams: Team[];
  teamMembers: TeamMember[];
  isLoading: boolean;
  error: string | null;
}

const initialState: TeamState = {
  teams: [],
  currentTeam: null,
  userTeams: [],
  teamMembers: [],
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchTeams = createAsyncThunk(
  'teams/fetchTeams',
  async (projectId: string) => {
    const response = await teamService.getTeams(projectId);
    return response;
  }
);

export const fetchTeamById = createAsyncThunk(
  'teams/fetchTeamById',
  async (teamId: string) => {
    const response = await teamService.getTeamById(teamId);
    return response;
  }
);

export const fetchUserTeams = createAsyncThunk(
  'teams/fetchUserTeams',
  async (userId: string) => {
    const response = await teamService.getUserTeams(userId);
    return response;
  }
);

export const fetchTeamMembers = createAsyncThunk(
  'teams/fetchTeamMembers',
  async (teamId: string) => {
    const response = await teamService.getTeamMembers(teamId);
    return response;
  }
);

export const createTeam = createAsyncThunk(
  'teams/createTeam',
  async (teamData: Partial<Team>) => {
    const response = await teamService.createTeam(teamData);
    return response;
  }
);

export const updateTeam = createAsyncThunk(
  'teams/updateTeam',
  async ({ id, teamData }: { id: string; teamData: Partial<Team> }) => {
    const response = await teamService.updateTeam(id, teamData);
    return response;
  }
);

export const deleteTeam = createAsyncThunk(
  'teams/deleteTeam',
  async (teamId: string) => {
    await teamService.deleteTeam(teamId);
    return teamId;
  }
);

export const addTeamMember = createAsyncThunk(
  'teams/addTeamMember',
  async ({ teamId, userId, role }: { teamId: string; userId: string; role: TeamMember['role'] }) => {
    const response = await teamService.addTeamMember(teamId, userId, role);
    return response;
  }
);

export const updateTeamMemberRole = createAsyncThunk(
  'teams/updateTeamMemberRole',
  async ({ teamId, userId, role }: { teamId: string; userId: string; role: TeamMember['role'] }) => {
    const response = await teamService.updateTeamMemberRole(teamId, userId, role);
    return response;
  }
);

export const removeTeamMember = createAsyncThunk(
  'teams/removeTeamMember',
  async ({ teamId, userId }: { teamId: string; userId: string }) => {
    await teamService.removeTeamMember(teamId, userId);
    return { teamId, userId };
  }
);

// Slice
const teamSlice = createSlice({
  name: 'teams',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentTeam: (state, action: PayloadAction<Team | null>) => {
      state.currentTeam = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch teams
      .addCase(fetchTeams.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTeams.fulfilled, (state, action) => {
        state.isLoading = false;
        state.teams = action.payload;
      })
      .addCase(fetchTeams.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch teams';
      })
      // Fetch team by ID
      .addCase(fetchTeamById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTeamById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentTeam = action.payload;
      })
      .addCase(fetchTeamById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch team';
      })
      // Fetch user teams
      .addCase(fetchUserTeams.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserTeams.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userTeams = action.payload;
      })
      .addCase(fetchUserTeams.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch user teams';
      })
      // Fetch team members
      .addCase(fetchTeamMembers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTeamMembers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.teamMembers = action.payload;
      })
      .addCase(fetchTeamMembers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch team members';
      })
      // Create team
      .addCase(createTeam.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createTeam.fulfilled, (state, action) => {
        state.isLoading = false;
        state.teams.push(action.payload);
        state.userTeams.push(action.payload);
      })
      .addCase(createTeam.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to create team';
      })
      // Update team
      .addCase(updateTeam.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateTeam.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.teams.findIndex(team => team.id === action.payload.id);
        if (index !== -1) {
          state.teams[index] = action.payload;
        }
        if (state.currentTeam?.id === action.payload.id) {
          state.currentTeam = action.payload;
        }
        const userIndex = state.userTeams.findIndex(team => team.id === action.payload.id);
        if (userIndex !== -1) {
          state.userTeams[userIndex] = action.payload;
        }
      })
      .addCase(updateTeam.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to update team';
      })
      // Delete team
      .addCase(deleteTeam.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteTeam.fulfilled, (state, action) => {
        state.isLoading = false;
        state.teams = state.teams.filter(team => team.id !== action.payload);
        state.userTeams = state.userTeams.filter(team => team.id !== action.payload);
        if (state.currentTeam?.id === action.payload) {
          state.currentTeam = null;
        }
      })
      .addCase(deleteTeam.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to delete team';
      })
      // Add team member
      .addCase(addTeamMember.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addTeamMember.fulfilled, (state, action) => {
        state.isLoading = false;
        state.teamMembers.push(action.payload);
        if (state.currentTeam?.id === action.payload.teamId) {
          state.currentTeam.members.push(action.payload);
        }
      })
      .addCase(addTeamMember.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to add team member';
      })
      // Update team member role
      .addCase(updateTeamMemberRole.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateTeamMemberRole.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.teamMembers.findIndex(member => member.id === action.payload.id);
        if (index !== -1) {
          state.teamMembers[index] = action.payload;
        }
        if (state.currentTeam?.id === action.payload.teamId) {
          const memberIndex = state.currentTeam.members.findIndex(member => member.id === action.payload.id);
          if (memberIndex !== -1) {
            state.currentTeam.members[memberIndex] = action.payload;
          }
        }
      })
      .addCase(updateTeamMemberRole.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to update team member role';
      })
      // Remove team member
      .addCase(removeTeamMember.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(removeTeamMember.fulfilled, (state, action) => {
        state.isLoading = false;
        state.teamMembers = state.teamMembers.filter(member => 
          !(member.teamId === action.payload.teamId && member.userId === action.payload.userId)
        );
        if (state.currentTeam?.id === action.payload.teamId) {
          state.currentTeam.members = state.currentTeam.members.filter(member => 
            member.userId !== action.payload.userId
          );
        }
      })
      .addCase(removeTeamMember.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to remove team member';
      });
  },
});

export const { clearError, setCurrentTeam } = teamSlice.actions;
export default teamSlice.reducer;